/**
 * Epigraph pool — 50 classic quotes spanning computing, romance, purpose,
 * and resistance. 10 from Indonesian literature, 40 international.
 *
 * One is randomly selected per page load in the home route loader so the
 * epigraph rotates without flicker (server-rendered, hydration-consistent).
 */

export type Quote = {
	text: string;
	author: string;
	source?: string;
	topic: "computer" | "romance" | "purpose" | "resistance";
};

export const QUOTES: Quote[] = [
	/* ---------- Indonesian literature (10) ---------- */
	{
		text: "Aku ingin hidup seribu tahun lagi.",
		author: "Chairil Anwar",
		source: "Aku",
		topic: "resistance",
	},
	{
		text: "Sekali berarti, sudah itu mati.",
		author: "Chairil Anwar",
		source: "Diponegoro",
		topic: "resistance",
	},
	{
		text: "Seorang terpelajar harus berlaku adil sudah sejak dalam pikiran, apalagi dalam perbuatan.",
		author: "Pramoedya Ananta Toer",
		source: "Bumi Manusia",
		topic: "purpose",
	},
	{
		text: "Menulis adalah sebuah keberanian.",
		author: "Pramoedya Ananta Toer",
		topic: "resistance",
	},
	{
		text: "Kesadaran adalah matahari. Kesabaran adalah bumi.",
		author: "W.S. Rendra",
		source: "Sajak Sebatang Lisong",
		topic: "purpose",
	},
	{
		text: "Aku ingin mencintaimu dengan sederhana: dengan kata yang tak sempat diucapkan kayu kepada api yang menjadikannya abu.",
		author: "Sapardi Djoko Damono",
		source: "Aku Ingin",
		topic: "romance",
	},
	{
		text: "Yang fana adalah waktu. Kita abadi.",
		author: "Sapardi Djoko Damono",
		source: "Yang Fana Adalah Waktu",
		topic: "purpose",
	},
	{
		text: "Hidup tanpa cita-cita ibarat melukis di atas air.",
		author: "Hamka",
		topic: "purpose",
	},
	{
		text: "Manusia merdeka adalah yang dapat memerintah dirinya sendiri.",
		author: "Ki Hajar Dewantara",
		topic: "resistance",
	},
	{
		text: "Engkau adalah surat cinta yang tak pernah selesai kutulis.",
		author: "Goenawan Mohamad",
		source: "Catatan Pinggir",
		topic: "romance",
	},

	/* ---------- Computer / craft (12) ---------- */
	{
		text: "We can only see a short distance ahead, but we can see plenty there that needs to be done.",
		author: "Alan M. Turing",
		source: "Computing Machinery and Intelligence",
		topic: "computer",
	},
	{
		text: "Computer science is no more about computers than astronomy is about telescopes.",
		author: "Edsger W. Dijkstra",
		topic: "computer",
	},
	{
		text: "Premature optimization is the root of all evil.",
		author: "Donald E. Knuth",
		topic: "computer",
	},
	{
		text: "Simplicity is prerequisite for reliability.",
		author: "Edsger W. Dijkstra",
		topic: "computer",
	},
	{
		text: "A language that doesn't affect the way you think about programming is not worth knowing.",
		author: "Alan J. Perlis",
		source: "Epigrams on Programming",
		topic: "computer",
	},
	{
		text: "Controlling complexity is the essence of computer programming.",
		author: "Brian W. Kernighan",
		topic: "computer",
	},
	{
		text: "The most dangerous phrase in the language is, 'We've always done it this way.'",
		author: "Grace Hopper",
		topic: "computer",
	},
	{
		text: "Programs must be written for people to read, and only incidentally for machines to execute.",
		author: "Harold Abelson",
		source: "Structure and Interpretation of Computer Programs",
		topic: "computer",
	},
	{
		text: "There are two ways of constructing a software design: one is to make it so simple that there are obviously no deficiencies; the other is to make it so complicated that there are no obvious deficiencies.",
		author: "C.A.R. Hoare",
		topic: "computer",
	},
	{
		text: "The Analytical Engine has no pretensions whatever to originate anything. It can do whatever we know how to order it to perform.",
		author: "Ada Lovelace",
		topic: "computer",
	},
	{
		text: "Talk is cheap. Show me the code.",
		author: "Linus Torvalds",
		topic: "computer",
	},
	{
		text: "Any sufficiently advanced technology is indistinguishable from magic.",
		author: "Arthur C. Clarke",
		source: "Profiles of the Future",
		topic: "computer",
	},

	/* ---------- Romance (9) ---------- */
	{
		text: "I love you without knowing how, or when, or from where.",
		author: "Pablo Neruda",
		source: "Sonnet XVII",
		topic: "romance",
	},
	{
		text: "Lovers don't finally meet somewhere. They're in each other all along.",
		author: "Rumi",
		topic: "romance",
	},
	{
		text: "How do I love thee? Let me count the ways.",
		author: "Elizabeth Barrett Browning",
		source: "Sonnets from the Portuguese, XLIII",
		topic: "romance",
	},
	{
		text: "Love consists in this, that two solitudes protect and touch and greet each other.",
		author: "Rainer Maria Rilke",
		source: "Letters to a Young Poet",
		topic: "romance",
	},
	{
		text: "Doubt thou the stars are fire; doubt that the sun doth move; doubt truth to be a liar; but never doubt I love.",
		author: "William Shakespeare",
		source: "Hamlet",
		topic: "romance",
	},
	{
		text: "She walks in beauty, like the night of cloudless climes and starry skies.",
		author: "Lord Byron",
		source: "She Walks in Beauty",
		topic: "romance",
	},
	{
		text: "Even after all this time the sun never says to the earth, 'You owe me.'",
		author: "Hafez",
		topic: "romance",
	},
	{
		text: "Someone, I tell you, in another time will remember us.",
		author: "Sappho",
		topic: "romance",
	},
	{
		text: "I almost wish we were butterflies and lived but three summer days — three such days with you I could fill with more delight than fifty common years could ever contain.",
		author: "John Keats",
		source: "Letter to Fanny Brawne",
		topic: "romance",
	},

	/* ---------- Purpose / goal (9) ---------- */
	{
		text: "Waste no more time arguing what a good man should be. Be one.",
		author: "Marcus Aurelius",
		source: "Meditations",
		topic: "purpose",
	},
	{
		text: "If a man knows not to which port he sails, no wind is favorable.",
		author: "Seneca",
		topic: "purpose",
	},
	{
		text: "Go confidently in the direction of your dreams. Live the life you have imagined.",
		author: "Henry David Thoreau",
		source: "Walden",
		topic: "purpose",
	},
	{
		text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
		author: "Ralph Waldo Emerson",
		topic: "purpose",
	},
	{
		text: "Do what you can, with what you have, where you are.",
		author: "Theodore Roosevelt",
		topic: "purpose",
	},
	{
		text: "He who has a why to live for can bear almost any how.",
		author: "Friedrich Nietzsche",
		source: "Twilight of the Idols",
		topic: "purpose",
	},
	{
		text: "Courage is grace under pressure.",
		author: "Ernest Hemingway",
		topic: "purpose",
	},
	{
		text: "The journey of a thousand miles begins with a single step.",
		author: "Lao Tzu",
		source: "Tao Te Ching",
		topic: "purpose",
	},
	{
		text: "When we are no longer able to change a situation, we are challenged to change ourselves.",
		author: "Viktor E. Frankl",
		source: "Man's Search for Meaning",
		topic: "purpose",
	},

	/* ---------- Resistance / perlawanan (10) ---------- */
	{
		text: "In a time of universal deceit, telling the truth is a revolutionary act.",
		author: "George Orwell",
		topic: "resistance",
	},
	{
		text: "Each generation must, out of relative obscurity, discover its mission, fulfill it, or betray it.",
		author: "Frantz Fanon",
		source: "The Wretched of the Earth",
		topic: "resistance",
	},
	{
		text: "Hope is not the conviction that something will turn out well, but the certainty that something makes sense regardless of how it turns out.",
		author: "Václav Havel",
		topic: "resistance",
	},
	{
		text: "There is no passion to be found playing small — settling for a life that is less than the one you are capable of living.",
		author: "Nelson Mandela",
		topic: "resistance",
	},
	{
		text: "The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.",
		author: "Albert Camus",
		source: "The Myth of Sisyphus",
		topic: "resistance",
	},
	{
		text: "Power concedes nothing without a demand. It never did and it never will.",
		author: "Frederick Douglass",
		source: "Address on West India Emancipation",
		topic: "resistance",
	},
	{
		text: "It is dangerous to be right in matters on which the established authorities are wrong.",
		author: "Voltaire",
		topic: "resistance",
	},
	{
		text: "The master's tools will never dismantle the master's house.",
		author: "Audre Lorde",
		topic: "resistance",
	},
	{
		text: "First they ignore you, then they laugh at you, then they fight you, then you win.",
		author: "Mahatma Gandhi",
		topic: "resistance",
	},
	{
		text: "Injustice anywhere is a threat to justice everywhere.",
		author: "Martin Luther King Jr.",
		source: "Letter from Birmingham Jail",
		topic: "resistance",
	},
];

/** Pick a random quote. Pure function — call inside a loader for SSR safety. */
export function randomQuote(): Quote {
	return QUOTES[Math.floor(Math.random() * QUOTES.length)] as Quote;
}
