import { config } from './config.js';
import { log } from './logger.js';
import { defectdojoRequests, defectdojoConnected } from './metrics.js';

interface DefectDojoProduct {
	id: number;
	name: string;
	description: string;
}

interface DefectDojoStatus {
	connected: boolean;
	url: string;
	products: DefectDojoProduct[];
	product_count: number;
	findings_summary: {
		total: number;
		by_severity: Record<string, number>;
	};
}

async function dojoFetch(path: string): Promise<Response> {
	return fetch(`${config.defectdojo.url}${path}`, {
		headers: {
			Authorization: `Token ${config.defectdojo.token}`,
			'Content-Type': 'application/json'
		}
	});
}

export async function initDefectDojo(): Promise<void> {
	if (!config.defectdojo.enabled) {
		log('info', 'DefectDojo disabled (DEFECTDOJO_URL not set)');
		return;
	}

	try {
		const resp = await dojoFetch('/api/v2/products/?limit=1');
		if (resp.ok) {
			defectdojoConnected.set(1);
			defectdojoRequests.inc({ endpoint: 'products', status: 'success' });
			log('info', 'DefectDojo connected', { url: config.defectdojo.url });
		} else {
			defectdojoConnected.set(0);
			defectdojoRequests.inc({ endpoint: 'products', status: 'error' });
			log('error', 'DefectDojo init failed', { status: resp.status });
		}
	} catch (err) {
		defectdojoConnected.set(0);
		log('error', 'DefectDojo init error', { error: String(err) });
	}
}

export async function getDefectDojoStatus(): Promise<DefectDojoStatus> {
	if (!config.defectdojo.enabled) {
		return {
			connected: false,
			url: '',
			products: [],
			product_count: 0,
			findings_summary: { total: 0, by_severity: {} }
		};
	}

	try {
		// Fetch products
		const productsResp = await dojoFetch('/api/v2/products/?limit=50');
		let products: DefectDojoProduct[] = [];
		let productCount = 0;

		if (productsResp.ok) {
			const data = await productsResp.json();
			defectdojoRequests.inc({ endpoint: 'products', status: 'success' });
			products = (data.results || []).map((p: Record<string, unknown>) => ({
				id: p.id,
				name: p.name,
				description: p.description || ''
			}));
			productCount = data.count || products.length;
		} else {
			defectdojoRequests.inc({ endpoint: 'products', status: 'error' });
		}

		// Fetch active findings
		const findingsResp = await dojoFetch('/api/v2/findings/?active=true&limit=100');
		let findingsTotal = 0;
		const bySeverity: Record<string, number> = {};

		if (findingsResp.ok) {
			const data = await findingsResp.json();
			defectdojoRequests.inc({ endpoint: 'findings', status: 'success' });
			findingsTotal = data.count || 0;
			for (const f of data.results || []) {
				const sev = f.severity || 'Unknown';
				bySeverity[sev] = (bySeverity[sev] || 0) + 1;
			}
		} else {
			defectdojoRequests.inc({ endpoint: 'findings', status: 'error' });
		}

		defectdojoConnected.set(1);

		return {
			connected: true,
			url: config.defectdojo.url,
			products,
			product_count: productCount,
			findings_summary: { total: findingsTotal, by_severity: bySeverity }
		};
	} catch (err) {
		defectdojoConnected.set(0);
		log('error', 'DefectDojo status error', { error: String(err) });
		return {
			connected: false,
			url: config.defectdojo.url,
			products: [],
			product_count: 0,
			findings_summary: { total: 0, by_severity: {} }
		};
	}
}
