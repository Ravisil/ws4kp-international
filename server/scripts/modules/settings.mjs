import Setting from './utils/setting.mjs';
import btnNavigateRefreshClick from '../index.mjs';

document.addEventListener('DOMContentLoaded', () => {
	init();
});

// default speed
const settings = {
	windUnits: { value: 2 },
	marineWindUnits: { value: 1 },
	marineWaveHeightUnits: { value: 1 },
	temperatureUnits: { value: 1 },
	distanceUnits: { value: 1 },
	pressureUnits: { value: 1 },
	hoursFormat: { value: 2 },
	speed: { value: 1.0 },
	experimentalFeatures: { value: false },
	hideWebamp: { value: false },
	kiosk: { value: false },
	scanLines: { value: false },
};

const init = () => {
	// Customizable measurement units
	settings.windUnits = new Setting('windUnits', 'Unidade de vento', 'select', 2, windUnitsChange, true, [
		[1, 'm/s'],
		[2, 'km/h'],
		[3, 'nós'],
		[4, 'mph'],
		[5, 'bft']
	]);
	settings.marineWindUnits = new Setting('marineWindUnits', 'Unidade de vento (marítimo)', 'select', 1, marineWindUnitsChange, true, [
		[1, 'nós'],
		[2, 'm/s'],
	]);
	settings.marineWaveHeightUnits = new Setting('marineWaveHeightUnits', 'Unidade de altura das ondas', 'select', 1, marineWaveHeightUnitsChange, true, [
		[1, 'pés'],
		[2, 'metros'],
	]);
	settings.temperatureUnits = new Setting('temperatureUnits', 'Unidade de temperatura', 'select', 1, temperatureChangeUnits, true, [
		[1, 'C'],
		[2, 'F'],
		[3, 'K'],
	]);
	settings.distanceUnits = new Setting('distanceUnits', 'Unidade de distância', 'select', 1, distanceChangeUnits, true, [
		[1, 'km'],
		[2, 'mi'],
		[3, 'ft'],
		[4, 'metros'],
		[5, 'bananas'],
	]);
	settings.pressureUnits = new Setting('pressureUnits', 'Unidade de pressão', 'select', 1, pressureChangeUnits, true, [
		[1, 'hPa'],
		[2, 'inHG'],
		[3, 'mmHG'],
	]);
	settings.hoursFormat = new Setting('hoursFormat', 'Formato de hora', 'select', 2, hoursChangeFormat, true, [
		[1, '12 horas'],
		[2, '24 horas'],
	]);

	settings.speed = new Setting('speed', 'Velocidade', 'select', 1.0, null, true, [
		[0.5, 'Muito rápida'],
		[0.75, 'Rápida'],
		[1.0, 'Normal'],
		[1.25, 'Lenta'],
		[1.5, 'Muito lenta'],
	]);
	settings.experimentalFeatures = new Setting(
		'experimentalFeatures',
		'Recursos experimentais <a href="https://github.com/mwood77/ws4kp-international?tab=readme-ov-file#updates-in-1100" target="_blank" rel="noopener noreferrer">(informações)</a>',
		'checkbox',
		false,
		experimentalFeaturesChange,
		true,
	);
	settings.hideWebamp = new Setting('hideWebamp', 'Ocultar Webamp (Winamp)', 'checkbox', false, hideWebampChange, true);
	settings.scanLines = new Setting('scanLines', 'Ativar linhas de varredura', 'checkbox', false, scanLinesChange, true);

	settings.wide = new Setting('wide', 'Tela larga', 'checkbox', false, wideScreenChange, true);
	settings.kiosk = new Setting('kiosk', 'Modo quiosque', 'checkbox', false, kioskChange, false);

	// generate html objects
	const settingHtml = Object.values(settings).map((d) => d.generate());

	// write to page
	const settingsSection = document.querySelector('#settings');
	settingsSection.innerHTML = '';
	settingsSection.append(...settingHtml);
};

const temperatureChangeUnits = (value) => {
	if (value) {
		document.documentElement.setAttribute('temperature-units', value);
	}
};

const distanceChangeUnits = (value) => {
	if (value) {
		document.documentElement.setAttribute('distance-units', value);
	}
};

const pressureChangeUnits = (value) => {
	if (value) {
		document.documentElement.setAttribute('pressure-units', value);
	}
};

const marineWaveHeightUnitsChange = (value) => {
	if (value) {
		document.documentElement.setAttribute('marine-wave-height-units', value);
	}
};

const marineWindUnitsChange = (value) => {
	if (value) {
		document.documentElement.setAttribute('marine-wind-units', value);
	}
};

const windUnitsChange = (value) => {
	if (value) {
		document.documentElement.setAttribute('wind-units', value);
	}
};

const hoursChangeFormat = (value) => {
	if (value) {
		document.documentElement.setAttribute('hours-format', value);
	}
};

const experimentalFeaturesChange = (value) => {
	document.documentElement.setAttribute('experimental-features', value);

	// @todo - this is a bit gnarly
	if (!value) localStorage.removeItem('nearbyCitiesFromLocality');
	btnNavigateRefreshClick();
};

const hideWebampChange = async (value) => {
	if (value) {
		document.documentElement.setAttribute('hide-webamp', value);
	} else {
		document.documentElement.removeAttribute('hide-webamp');
	}

	// Webamp is a global variable, defined in a <script>
	// tag in index.ejs, so we can access it directly

	// Wait until the global webamp instance is available
	if (!window.webamp) {
		console.warn('Webamp not initialized yet.');
		return;
	}

	if (value === true) {
		// eslint-disable-next-line no-undef
		await webamp.close();
	} else {
		// eslint-disable-next-line no-undef
		await webamp.reopen();
	}
};

const scanLinesChange = (value) => {
	const container = document.querySelector('#divTwc');
	if (value) {
		container.classList.add('scan-lines');
	} else {
		container.classList.remove('scan-lines');
	}
};

const wideScreenChange = (value) => {
	const container = document.querySelector('#divTwc');
	if (value) {
		container.classList.add('wide');
	} else {
		container.classList.remove('wide');
	}
};

const kioskChange = (value) => {
	const body = document.querySelector('body');
	if (value) {
		body.classList.add('kiosk');
		window.dispatchEvent(new Event('resize'));
	} else {
		body.classList.remove('kiosk');
	}
};

export default settings;
