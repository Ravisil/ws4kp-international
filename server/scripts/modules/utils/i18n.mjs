// Camada mínima de idioma (português do Brasil).
// Não importa nada de fora, para poder ser usada também no servidor Node.
//
// As chaves internas (ex.: nomes usados para escolher ícones) continuam em inglês;
// apenas o texto exibido ao usuário é traduzido aqui.
const LOCALE = 'pt-BR';

// primeira letra maiúscula ("segunda" -> "Segunda")
const capitalize = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);

// "segunda-feira" -> "Segunda" (cabe melhor nos quadros da tela, como nas previsões da TV)
const weekdayLabel = (text) => capitalize(text.replace('-feira', ''));

// nome do dia da semana para uma data JS (ex.: "Segunda", "Sábado")
const weekdayName = (date, options = {}) => weekdayLabel(new Date(date).toLocaleDateString(LOCALE, { weekday: 'long', ...options }));

// rosa dos ventos simplificada, com 8 direções (L = Leste, O = Oeste)
const COMPASS = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
const COMPASS_NAMES = ['Norte', 'Nordeste', 'Leste', 'Sudeste', 'Sul', 'Sudoeste', 'Oeste', 'Noroeste'];

// condições do mar: chave interna (inglês) -> texto exibido
const SEAS_LABELS = {
	calm: 'calmo',
	smooth: 'liso',
	slight: 'leve',
	choppy: 'ondulado',
	'mdt chop': 'agitado',
	rough: 'revolto',
	'v rough': 'muito revolto',
	high: 'alto',
	'v high': 'muito alto',
	phenomenal: 'fenomenal',
};

const seasLabel = (key) => SEAS_LABELS[key] ?? key;

export {
	LOCALE,
	COMPASS,
	COMPASS_NAMES,
	weekdayName,
	weekdayLabel,
	capitalize,
	seasLabel,
};
