import { directionToName } from './calc.mjs';
import { weekdayName } from './i18n.mjs';

import ConversionHelpers from './conversionHelpers.mjs';

function generateLocalForecast(dateStamp, hourlyData) {
	const MORNING_HOURS = [...Array(12).keys()].map((h) => h + 6); // 6 AM - 6 PM
	const NIGHT_HOURS = [...Array(6).keys()].map((h) => h + 18).concat([...Array(6).keys()]); // 6 PM - 6 AM

	// as chaves ('CHANCE OF PRECIPITATION', 'CLEAR'...) são internas; apenas os textos são exibidos
	const phraseVariations = {
		'CHANCE OF PRECIPITATION': ['PROBABILIDADE DE PRECIPITAÇÃO', 'CHANCE DE PRECIPITAÇÃO', 'CHANCE DE PANCADAS', 'POSSIBILIDADE DE PRECIPITAÇÃO', 'POSSIBILIDADE DE CHUVA', 'PANCADAS ESPERADAS', 'PRECIPITAÇÃO PROVÁVEL'],
		WIND: ['VENTOS DE', 'VENTOS SOPRANDO DE', 'BRISA DE', 'RAJADAS DE'],
		CLOUDY: ['NUBLADO', 'CÉU MUITO NUBLADO', 'CÉU ENCOBERTO', 'CÉU PARCIALMENTE NUBLADO', 'NUVENS COM INTERVALOS DE SOL', 'NUVENS DOMINAM O CÉU'],
		CLEAR: ['CÉU QUASE LIMPO', 'POUCAS NUVENS', 'CÉU LIMPO', 'LIMPO E ENSOLARADO', 'CÉU CLARO', 'QUASE SEM NUVENS'],
		'SNOW SHOWERS': ['PANCADAS DE NEVE', 'NEVE PROVÁVEL', 'NEVASCA ESPERADA', 'NEVE FRACA POSSÍVEL'],
	};

	// {tempLabel} é sempre feminino (MÁXIMA / MÍNIMA)
	const forecastTemplates = [
		'{period}...  {cloudCover}, COM {tempLabel} EM TORNO DE {temp}. {windInfo}. {precipChance}',
		'{period}... {cloudCover}, {tempLabel} PERTO DE {temp}. {windInfo}. {precipChance}',
		'{period}... {cloudCover}, {tempLabel} PRÓXIMA DE {temp}. {windInfo}. {precipChance}',
		'{period}: {cloudCover}, COM {tempLabel} DE {temp}. {windInfo}. {precipChance}',
		'{period} - PREVISÃO: {cloudCover}, {tempLabel} DE {temp}. {windInfo}. {precipChance}',
		'{period} - PERSPECTIVA: {cloudCover}, ESPERE {tempLabel} EM TORNO DE {temp}. {windInfo}. {precipChance}',
		'{period} - TEMPO: {cloudCover}, {tempLabel} DE {temp}. {windInfo}. {precipChance}',
		'{period}... {cloudCover}, {tempLabel} PRÓXIMA DE {temp}. {windInfo}. {precipChance}',
		'{period}... {tempLabel} PERTO DE {temp}. {cloudCover}. {windInfo}. {precipChance}',
		'{period}... {cloudCover}. {windInfo}. {precipChance} {tempLabel} EM TORNO DE {temp}.',
		'{period} - PREVISÃO: {cloudCover}, COM TEMPERATURAS EM TORNO DE {temp}. {windInfo}. {precipChance}',
		'{period} - PERSPECTIVA DO TEMPO: {cloudCover}. {windInfo}. {precipChance} ESPERE TEMPERATURAS EM TORNO DE {temp}.',
	];

	// texto exibido para cada período (as chaves 'MORNING' / 'NIGHT' continuam internas)
	const periodLabels = {
		MORNING: 'DURANTE O DIA',
		NIGHT: 'À NOITE',
	};

	function getMostFrequent(arr) {
		return arr.sort((a, b) => arr.filter((v) => v === a).length - arr.filter((v) => v === b).length).pop();
	}

	// eslint-disable-next-line no-shadow
	function processForecast(hourlyData, period) {
		const periodData = hourlyData.filter((entry) => (period === 'MORNING' ? MORNING_HOURS : NIGHT_HOURS).includes(new Date(entry.time).getHours()));

		if (!periodData.length) return null;

		const temps = periodData.map((entry) => ConversionHelpers.convertTemperatureUnits(Math.round(entry.temperature_2m)));
		const temp = period === 'MORNING' ? Math.max(...temps) : Math.min(...temps);
		const tempLabel = period === 'MORNING' ? 'MÁXIMA' : 'MÍNIMA';

		const windSpeeds = periodData.map((entry) => ConversionHelpers.convertWindUnits(Math.round(entry.wind_speed_10m)));
		const windDirs = periodData.map((entry) => entry.wind_direction_10m);
		const windInfo = `VENTO DE ${directionToName(getMostFrequent(windDirs)).toUpperCase()}, ENTRE ${Math.min(...windSpeeds)} E ${Math.max(...windSpeeds)} ${ConversionHelpers.getWindUnitText().toUpperCase()}`;

		const precipProbs = periodData.map((entry) => entry.precipitation_probability);
		const maxPrecip = Math.max(...precipProbs);
		let precipChance = 'SEM PREVISÃO DE PRECIPITAÇÃO.';

		if (maxPrecip >= 30) {
			const peakHour = periodData.find((entry) => entry.precipitation_probability === maxPrecip)?.time;
			const hour = new Date(peakHour).getHours();
			const precipTime = `APÓS ${String(hour).padStart(2, '0')}H`;
			precipChance = `${phraseVariations['CHANCE OF PRECIPITATION'][Math.floor(Math.random() * phraseVariations['CHANCE OF PRECIPITATION'].length)]} ${precipTime}. A CHANCE É DE ${maxPrecip}%.`;
		}

		const cloudCover = periodData.map((entry) => entry.cloud_cover);
		const averagedCloudCover = Math.max(...cloudCover);
		let cloudCoverText = '';

		if (averagedCloudCover >= 0 && averagedCloudCover < 20) {
			cloudCoverText = phraseVariations.CLEAR[Math.floor(Math.random() * 3)];
		} else if (averagedCloudCover >= 20 && averagedCloudCover < 50) {
			cloudCoverText = phraseVariations.CLEAR[Math.floor(Math.random() * 3)];
		} else if (averagedCloudCover >= 50 && averagedCloudCover < 80) {
			cloudCoverText = phraseVariations.CLOUDY[Math.floor(Math.random() * 3)];
		} else {
			cloudCoverText = phraseVariations.CLOUDY[Math.floor(Math.random() * 3)];
		}

		const forecastText = forecastTemplates[Math.floor(Math.random() * forecastTemplates.length)]
			.replace('{period}', periodLabels[period])
			.replace('{cloudCover}', cloudCoverText)
			.replace('{tempLabel}', tempLabel)
			.replace('{temp}', temp)
			.replace('{windInfo}', windInfo)
			.replace('{precipChance}', precipChance)
			.replace(/\n/g, '')
			.replace(/\r/g, '');

		return {
			period,
			temperature: { label: tempLabel, value: temp },
			wind: windInfo,
			precipitation: precipChance,
			skyCondition: cloudCover,
			text: forecastText,
		};
	}

	// Generate forecast for the provided date
	const dayDate = new Date(dateStamp);
	const dayStr = weekdayName(dayDate).toUpperCase();

	const dailyData = hourlyData.filter((entry) => new Date(entry.time).toDateString() === dayDate.toDateString());

	const morningForecast = processForecast(dailyData, 'MORNING');
	const nightForecast = processForecast(dailyData, 'NIGHT');

	const forecast = {
		date: dayStr,
		periods: {
			morning: morningForecast,
			night: nightForecast,
		},
	};

	return JSON.stringify(forecast, null, 2);
}

export {
	// eslint-disable-next-line import/prefer-default-export
	generateLocalForecast,
};
