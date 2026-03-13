--
-- PostgreSQL database dump
--

\restrict YJzxr3qHKBu3hjRmntsQE9KQ5YNJBzxdBjsTWMycECRVVBZoBrfFgyhuIJPFFdf

-- Dumped from database version 16.12 (Debian 16.12-1.pgdg13+1)
-- Dumped by pg_dump version 16.12 (Debian 16.12-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: User; Type: TABLE; Schema: public; Owner: akhil
--

CREATE TABLE public."User" (
    user_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    membership_number character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    pin_hash character varying(255),
    role character varying(255) DEFAULT 'member'::character varying NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    phone_number character varying(15) NOT NULL,
    CONSTRAINT "User_role_check" CHECK (((role)::text = ANY (ARRAY[('admin'::character varying)::text, ('member'::character varying)::text]))),
    CONSTRAINT "User_status_check" CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('pending'::character varying)::text, ('suspended'::character varying)::text]))),
    CONSTRAINT user_phone_check CHECK (((phone_number)::text ~ '^[0-9]{10}$'::text))
);


ALTER TABLE public."User" OWNER TO akhil;

--
-- Name: author; Type: TABLE; Schema: public; Owner: akhil
--

CREATE TABLE public.author (
    author_id bigint NOT NULL,
    author_name character varying(255) NOT NULL
);


ALTER TABLE public.author OWNER TO akhil;

--
-- Name: author_author_id_seq; Type: SEQUENCE; Schema: public; Owner: akhil
--

CREATE SEQUENCE public.author_author_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.author_author_id_seq OWNER TO akhil;

--
-- Name: author_author_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akhil
--

ALTER SEQUENCE public.author_author_id_seq OWNED BY public.author.author_id;


--
-- Name: book; Type: TABLE; Schema: public; Owner: akhil
--

CREATE TABLE public.book (
    book_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    isbn character varying(255) NOT NULL,
    publisher character varying(255),
    published_year integer,
    edition character varying(255),
    language character varying(255),
    description text,
    cover_image_url text
);


ALTER TABLE public.book OWNER TO akhil;

--
-- Name: book_author; Type: TABLE; Schema: public; Owner: akhil
--

CREATE TABLE public.book_author (
    book_id bigint NOT NULL,
    author_id bigint NOT NULL
);


ALTER TABLE public.book_author OWNER TO akhil;

--
-- Name: book_book_id_seq; Type: SEQUENCE; Schema: public; Owner: akhil
--

CREATE SEQUENCE public.book_book_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.book_book_id_seq OWNER TO akhil;

--
-- Name: book_book_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akhil
--

ALTER SEQUENCE public.book_book_id_seq OWNED BY public.book.book_id;


--
-- Name: book_genre; Type: TABLE; Schema: public; Owner: akhil
--

CREATE TABLE public.book_genre (
    book_id bigint NOT NULL,
    genre_id bigint NOT NULL
);


ALTER TABLE public.book_genre OWNER TO akhil;

--
-- Name: fine; Type: TABLE; Schema: public; Owner: akhil
--

CREATE TABLE public.fine (
    fine_id bigint NOT NULL,
    issue_id bigint NOT NULL,
    amount numeric(38,2) NOT NULL,
    paid_status character varying(255) DEFAULT 'unpaid'::character varying NOT NULL,
    payment_date date,
    CONSTRAINT fine_paid_status_check CHECK (((paid_status)::text = ANY ((ARRAY['paid'::character varying, 'unpaid'::character varying, 'waived'::character varying])::text[])))
);


ALTER TABLE public.fine OWNER TO akhil;

--
-- Name: fine_fine_id_seq; Type: SEQUENCE; Schema: public; Owner: akhil
--

CREATE SEQUENCE public.fine_fine_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fine_fine_id_seq OWNER TO akhil;

--
-- Name: fine_fine_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akhil
--

ALTER SEQUENCE public.fine_fine_id_seq OWNED BY public.fine.fine_id;


--
-- Name: genre; Type: TABLE; Schema: public; Owner: akhil
--

CREATE TABLE public.genre (
    genre_id bigint NOT NULL,
    genre_name character varying(255) NOT NULL
);


ALTER TABLE public.genre OWNER TO akhil;

--
-- Name: genre_genre_id_seq; Type: SEQUENCE; Schema: public; Owner: akhil
--

CREATE SEQUENCE public.genre_genre_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.genre_genre_id_seq OWNER TO akhil;

--
-- Name: genre_genre_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akhil
--

ALTER SEQUENCE public.genre_genre_id_seq OWNED BY public.genre.genre_id;


--
-- Name: issue_record; Type: TABLE; Schema: public; Owner: akhil
--

CREATE TABLE public.issue_record (
    issue_id bigint NOT NULL,
    user_id uuid NOT NULL,
    copy_id bigint NOT NULL,
    borrow_date date NOT NULL,
    due_date date NOT NULL,
    return_date date,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp(6) without time zone,
    renewed boolean,
    CONSTRAINT issue_record_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('returned'::character varying)::text, ('overdue'::character varying)::text])))
);


ALTER TABLE public.issue_record OWNER TO akhil;

--
-- Name: issue_record_issue_id_seq; Type: SEQUENCE; Schema: public; Owner: akhil
--

CREATE SEQUENCE public.issue_record_issue_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.issue_record_issue_id_seq OWNER TO akhil;

--
-- Name: issue_record_issue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akhil
--

ALTER SEQUENCE public.issue_record_issue_id_seq OWNED BY public.issue_record.issue_id;


--
-- Name: membership; Type: TABLE; Schema: public; Owner: akhil
--

CREATE TABLE public.membership (
    user_id uuid NOT NULL,
    membership_type_id bigint NOT NULL,
    start_date date NOT NULL,
    end_date date,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    CONSTRAINT membership_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'expired'::character varying])::text[])))
);


ALTER TABLE public.membership OWNER TO akhil;

--
-- Name: membership_type; Type: TABLE; Schema: public; Owner: akhil
--

CREATE TABLE public.membership_type (
    membership_type_id bigint NOT NULL,
    type_name character varying(50) NOT NULL,
    borrow_limit integer NOT NULL,
    borrow_duration_days integer NOT NULL,
    fine_per_day numeric(10,2) NOT NULL,
    reservation_limit integer NOT NULL
);


ALTER TABLE public.membership_type OWNER TO akhil;

--
-- Name: membership_type_membership_type_id_seq; Type: SEQUENCE; Schema: public; Owner: akhil
--

CREATE SEQUENCE public.membership_type_membership_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.membership_type_membership_type_id_seq OWNER TO akhil;

--
-- Name: membership_type_membership_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akhil
--

ALTER SEQUENCE public.membership_type_membership_type_id_seq OWNED BY public.membership_type.membership_type_id;


--
-- Name: physical_copy; Type: TABLE; Schema: public; Owner: akhil
--

CREATE TABLE public.physical_copy (
    copy_id bigint NOT NULL,
    book_id bigint NOT NULL,
    status character varying(255) DEFAULT 'available'::character varying NOT NULL,
    shelf_location character varying(255),
    CONSTRAINT physical_copy_status_check CHECK (((status)::text = ANY (ARRAY[('available'::character varying)::text, ('issued'::character varying)::text, ('reserved'::character varying)::text, ('damaged'::character varying)::text, ('lost'::character varying)::text])))
);


ALTER TABLE public.physical_copy OWNER TO akhil;

--
-- Name: physical_copy_copy_id_seq; Type: SEQUENCE; Schema: public; Owner: akhil
--

CREATE SEQUENCE public.physical_copy_copy_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.physical_copy_copy_id_seq OWNER TO akhil;

--
-- Name: physical_copy_copy_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akhil
--

ALTER SEQUENCE public.physical_copy_copy_id_seq OWNED BY public.physical_copy.copy_id;


--
-- Name: reservation; Type: TABLE; Schema: public; Owner: akhil
--

CREATE TABLE public.reservation (
    reservation_id bigint NOT NULL,
    user_id uuid NOT NULL,
    book_id bigint NOT NULL,
    reservation_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    expires_at timestamp without time zone DEFAULT (CURRENT_TIMESTAMP + '24:00:00'::interval) NOT NULL,
    CONSTRAINT reservation_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('fulfilled'::character varying)::text, ('expired'::character varying)::text, ('cancelled'::character varying)::text])))
);


ALTER TABLE public.reservation OWNER TO akhil;

--
-- Name: reservation_reservation_id_seq; Type: SEQUENCE; Schema: public; Owner: akhil
--

CREATE SEQUENCE public.reservation_reservation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reservation_reservation_id_seq OWNER TO akhil;

--
-- Name: reservation_reservation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akhil
--

ALTER SEQUENCE public.reservation_reservation_id_seq OWNED BY public.reservation.reservation_id;


--
-- Name: transaction_log; Type: TABLE; Schema: public; Owner: akhil
--

CREATE TABLE public.transaction_log (
    log_id bigint NOT NULL,
    user_id uuid,
    action_type character varying(50) NOT NULL,
    reference_type character varying(50),
    reference_id bigint,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    details text
);


ALTER TABLE public.transaction_log OWNER TO akhil;

--
-- Name: transaction_log_log_id_seq; Type: SEQUENCE; Schema: public; Owner: akhil
--

CREATE SEQUENCE public.transaction_log_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transaction_log_log_id_seq OWNER TO akhil;

--
-- Name: transaction_log_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: akhil
--

ALTER SEQUENCE public.transaction_log_log_id_seq OWNED BY public.transaction_log.log_id;


--
-- Name: author author_id; Type: DEFAULT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.author ALTER COLUMN author_id SET DEFAULT nextval('public.author_author_id_seq'::regclass);


--
-- Name: book book_id; Type: DEFAULT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.book ALTER COLUMN book_id SET DEFAULT nextval('public.book_book_id_seq'::regclass);


--
-- Name: fine fine_id; Type: DEFAULT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.fine ALTER COLUMN fine_id SET DEFAULT nextval('public.fine_fine_id_seq'::regclass);


--
-- Name: genre genre_id; Type: DEFAULT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.genre ALTER COLUMN genre_id SET DEFAULT nextval('public.genre_genre_id_seq'::regclass);


--
-- Name: issue_record issue_id; Type: DEFAULT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.issue_record ALTER COLUMN issue_id SET DEFAULT nextval('public.issue_record_issue_id_seq'::regclass);


--
-- Name: membership_type membership_type_id; Type: DEFAULT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.membership_type ALTER COLUMN membership_type_id SET DEFAULT nextval('public.membership_type_membership_type_id_seq'::regclass);


--
-- Name: physical_copy copy_id; Type: DEFAULT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.physical_copy ALTER COLUMN copy_id SET DEFAULT nextval('public.physical_copy_copy_id_seq'::regclass);


--
-- Name: reservation reservation_id; Type: DEFAULT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.reservation ALTER COLUMN reservation_id SET DEFAULT nextval('public.reservation_reservation_id_seq'::regclass);


--
-- Name: transaction_log log_id; Type: DEFAULT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.transaction_log ALTER COLUMN log_id SET DEFAULT nextval('public.transaction_log_log_id_seq'::regclass);


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: akhil
--

COPY public."User" (user_id, membership_number, name, email, password_hash, pin_hash, role, status, created_at, phone_number) FROM stdin;
8f972b86-41ed-4f58-b849-df3dafe84122	MEM005	Nair	nair@test.com	$2a$10$0XpxIuviqaW7Mon3nDi6/uxnmRdeVP2cfSpHP.SuK9c/wW5CA1e5K	\N	member	active	\N	9876543201
001188ef-cb81-4a9f-b7fd-9e77d4c2c712	MEM008	Afa Afsal	afa123@test.com	$2a$10$XLRRx3f0qW4acBibAlPzDeByWw0FsjE2a0lqrs18Z0jLyC90Vf1/.	\N	member	active	\N	1254789631
c4455926-9866-4353-9745-8c2a903987b8	MEM006	Rohit R	rohit@test.com	$2a$10$sg08rrtvmUeuvtl0nJ.V5eFAJ/RCfnNTXbirckZ3/wu/5G1oSP.vm	\N	member	active	\N	8787989856
d622016c-8edc-4b3d-acbd-96a365312cf4	MEM013	Arjun Sabu	arjun@test.com	$2a$10$raMZZlJQvhWXC5w28RlxkuERvN52pU9wYKHIAX4yhhKUF0gkj8m4O	\N	member	active	\N	7412589652
a325e718-f6cc-4789-8abb-cbc83d459e6b	MEM007	abc	abc@test.com	$2a$10$/nsEqakccb4tUbA1ID69POcR2WgkLOPz4M4oDYsOzUCIJ7vk7F4nq	\N	member	active	\N	7776543201
248b588e-1eed-4e8a-9363-481c1e647aa0	ADMIN001	System Admin	admin@test.com	$2a$12$oPct4SrEL7j.AJ0zHeCtZuQhrsq0h3qUxJKci5Pqmn8PGqmyeIJse	\N	admin	active	2026-02-26 05:04:05.154984	9999999999
f17f6c92-c453-41a6-a6a5-8799b8476232	MEM009	sree	sree@test.com	$2a$10$Ov.0dQOD3VC3ziv18cMPwuUmkxL0777YtHeahPUDcT6yTZt9VuwCW	\N	member	active	\N	1231231324
e1f80598-b00c-4790-ae39-0573cc5a9368	MEM010	Agnes 	agnes@test.com	$2a$10$DX5h09Ww991SF0wWOTdwWOwnKZGU2rLYxsFHmJkzXwli4WwO1MXHa	\N	member	active	\N	1234554321
a3fb9592-8edd-420f-b196-0fbd8097eab2	MEM011	Sreejith	sreejith@test.com	$2a$10$VCxoxM96Z.VRai8Y3Uu6f.qrZFlnN/tq2ePsuaAeBNLSGtU8BO.iS	\N	member	active	\N	1010202056
c3a1ba17-ffb9-4d70-b318-6ad190029043	MEM012	admin s 	admin123@test.com	$2a$10$KtLHaBw8fKwxwc1fRfDgM.yxOswSDRR9pkdihOShPsNQecogvVBzW	\N	admin	suspended	\N	7412589630
eaedb4e6-77e2-4927-9d50-2dcbf34ad487	MEM003	Akhil	akhil@test.com	$2a$10$faw3DB3dn1pThgiIffIkI.4OkMEvUERKB8OfHuYIIs7TElfNKA512	$2a$10$wL17mHiB6iZZhwzcv4lkuufrH1FJMXs3ruq7xwEz1bNpmGcR0ogWW	member	active	2026-02-26 17:08:43.415726	9876543210
7e819205-a0df-46cc-af0a-feff2c2a3320	MEM004	Akhil Nair	akhi@test.com	$2a$10$HlYbVCoCAh5hb3Xv7yD3KefE8...eFGoqiHNsfXQ3F/Y95WNRGMFu	\N	admin	active	\N	9876543211
\.


--
-- Data for Name: author; Type: TABLE DATA; Schema: public; Owner: akhil
--

COPY public.author (author_id, author_name) FROM stdin;
54	Paulo Coelho
55	J. K. Rowling
56	Harper Lee
57	George Orwell
58	F. Scott Fitzgerald
59	Jane Austen
60	J. R. R. Tolkien
61	J.D. Salinger
62	John Ronald Reuel Tolkien
63	Yuval Noah Harari
64	James Clear
65	Robert T. Kiyosaki
66	Charles Duhigg
67	Napoleon Hill
68	Stephen R. Covey
69	Mark Manson
70	Héctor García
71	Francesc Miralles
72	Simon Sinek
73	Cal Newport
74	Robert C. Martin
75	David Hurst Thomas
76	Andrew Hunt
77	Thomas H. Cormen
78	Charles E. Leiserson
79	Ronald L. Rivest
80	Clifford Stein
81	Erich Gamma
82	Richard Helm
83	Ralph Johnson
84	John Vlissides
85	Steve McConnell
86	Gayle Laakmann McDowell
87	Eric Matthes
88	Dan Brown
89	Markus Zusak
90	Stephen King
91	Gillian Flynn
92	Stieg Larsson
93	Max Brooks
94	John Keegan
95	Ella Grace
96	J.R.R. Tolkien
97	George R. R. Martin
98	Wayne G. Hammond
99	Christina Scull
100	Homer
101	Neil Gaiman
102	Elizabeth Gilbert
103	Douglas R. Hofstadter
104	David Allen
105	Jared Diamond
106	Bessel A. Van der Kolk
107	Amor Towles
108	Frank Herbert
109	David Foster Wallace
110	Brian Greene
111	Richard P. Feynman
112	Robert B. Leighton
113	Matthew Sands
114	Fyodor Dostoyevsky
115	James Joyce
116	Charles Dickens
117	Miguel De Cervantes Saavedra
118	Charlotte Brontë
119	Alexandre Dumas
120	Arthur Miller
121	Plato
122	Giovanni Boccaccio
123	Marcus Aurelius
124	Euripides
125	Suetonius
126	Ray Dalio
127	Brit Bennett
128	Ta-Nehisi Coates
129	Anthony Doerr
130	Timothy Ferriss
131	Min Jin Lee
132	Jim Collins
133	Jon Krakauer
134	Stephen Hawking
135	E. L. James
136	Peter F. Drucker
\.


--
-- Data for Name: book; Type: TABLE DATA; Schema: public; Owner: akhil
--

COPY public.book (book_id, title, isbn, publisher, published_year, edition, language, description, cover_image_url) FROM stdin;
44	Pride and Prejudice	9780141439518	National Geographic Books	2002		en	Austen's most popular novel, the unforgettable story of Elizabeth Bennet and Mr. Darcy Few have failed to be charmed by the witty and independent spirit of Elizabeth Bennet in Austen’s beloved classic Pride and Prejudice. When Elizabeth Bennet first meets eligible bachelor Fitzwilliam Darcy, she thinks him arrogant and conceited; he is indifferent to her good looks and lively mind. When she later discovers that Darcy has involved himself in the troubled relationship between his friend Bingley and her beloved sister Jane, she is determined to dislike him more than ever. In the sparkling comedy of manners that follows, Jane Austen shows us the folly of judging by first impressions and superbly evokes the friendships, gossip and snobberies of provincial middle-class life. This Penguin Classics edition, based on Austen's first edition, contains the original Penguin Classics introduction by Tony Tanner and an updated introduction and notes by Viven Jones. For more than seventy years, Penguin has been the leading publisher of classic literature in the English-speaking world. With more than 1,700 titles, Penguin Classics represents a global bookshelf of the best works throughout history and across genres and disciplines. Readers trust the series to provide authoritative texts enhanced by introductions and notes by distinguished scholars and contemporary authors, as well as up-to-date translations by award-winning translators.	https://books.google.com/books/content?id=uY6MEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
39	The Alchemist	9780061122415	Harper Collins	2006		en	"My heart is afraid that it will have to suffer," the boy told the alchemist one night as they looked up at the moonless sky." Tell your heart that the fear of suffering is worse than the suffering itself. And that no heart has ever suffered when it goes in search of its dreams." Every few decades a book is published that changes the lives of its readers forever. The Alchemist is such a book. With over a million and a half copies sold around the world, The Alchemist has already established itself as a modern classic, universally admired. Paulo Coelho's charming fable, now available in English for the first time, will enchant and inspire an even wider audience of readers for generations to come. The Alchemist is the magical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure as extravagant as any ever found. From his home in Spain he journeys to the markets of Tangiers and across the Egyptian desert to a fateful encounter with the alchemist. The story of the treasures Santiago finds along the way teaches us, as only a few stories have done, about the essential wisdom of listening to our hearts, learning to read the omens strewn along life's path, and, above all, following our dreams.	https://books.google.com/books/content?id=pTr44Sx6oWQC&printsec=frontcover&img=1&zoom=1&source=gbs_api
40	Harry Potter and the Philosopher's Stone	0747545723	Bloomsbury Harry Potter	1999		en	When a letter arrives for unhappy but ordinary Harry Potter, a decade-old secret is revealed to him that apparently he's the last to know. His parents were wizards, killed by a Dark Lord's curse when Harry was just a baby, and which he somehow survived. Escaping his hideous Muggle guardians for Hogwarts, a wizarding school brimming with ghosts and enchantments, Harry stumbles upon a sinister adventure when he finds a three-headed dog guarding a room on the third floor. Then he hears of a missing stone with astonishing powers which could be valuable, dangerous, or both.	https://books.google.com/books/content?id=Z2ZzvgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
41	To Kill a Mockingbird	9780061120084	Harper Perennial Modern Classics	2006		en	Harper Lee's Pulitzer Prize-winning masterwork of honor and injustice in the deep South -- and the heroism of one man in the face of blind and violent hatred One of the best-loved stories of all time, To Kill a Mockingbird has been translated into more than forty languages, sold more than thirty million copies worldwide, served as the basis of an enormously popular motion picture, and was voted one of the best novels of the twentieth century by librarians across the country. A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice, it views a world of great beauty and savage inequities through the eyes of a young girl, as her father -- a crusading local lawyer -- risks everything to defend a black man unjustly accused of a terrible crime.	https://books.google.com/books/content?id=ncuX8p2xLIUC&printsec=frontcover&img=1&zoom=1&source=gbs_api
43	The Great Gatsby	9780743273565	Simon and Schuster	2004		en	A mysterious American millionaire tries to recapture the sweetheart of his youth, which results in tragedy.	https://books.google.com/books/content?id=fIlQDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api
45	The Hobbit, Or, There and Back Again	9780547928227	Mariner Books	2012		en	Celebrating 75 years of one of the world's most treasured classics with an all new trade paperback edition. Repackaged with new cover art. 500,000 first printing.	https://books.google.com/books/content?id=LLSpngEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
46	The Catcher in the Rye	9780316769488	Little, Brown	1991		en	The "brilliant, funny, meaningful novel" (The New Yorker) that established J. D. Salinger as a leading voice in American literature--and that has instilled in millions of readers around the world a lifelong love of books. "If you really want to hear about it, the first thing you'll probably want to know is where I was born, and what my lousy childhood was like, and how my parents were occupied and all before they had me, and all that David Copperfield kind of crap, but I don't feel like going into it, if you want to know the truth." The hero-narrator of The Catcher in the Rye is an ancient child of sixteen, a native New Yorker named Holden Caufield. Through circumstances that tend to preclude adult, secondhand description, he leaves his prep school in Pennsylvania and goes underground in New York City for three days.	https://books.google.com/books/content?id=ZotvleqZomIC&printsec=frontcover&img=1&zoom=1&source=gbs_api
62	Code Complete	9780735619678	Developer Best Practices	2004		en	This practical handbook of software construction is fully updated and revised with leading-edge practices and hundreds of new code samples, illustrating the art and science of constructing software.	https://books.google.com/books/content?id=QnghAQAAIAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
63	Cracking the Coding Interview	9780984782857	Careercup	2015		en	Now in the 6th edition, the book gives you the interview preparation you need to get the top software developer jobs. This is a deeply technical book and focuses on the software engineering skills to ace your interview. The book includes 189 programming interview questions and answers, as well as other advice.	https://books.google.com/books/content?id=jD8iswEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
48	Sapiens	9780062316097	Harper	2015		en	One hundred thousand years ago, at least six human species inhabited the earth. Today there is just one. Us. Homo sapiens. How did our species succeed in the battle for dominance? Why did our foraging ancestors come together to create cities and kingdoms? How did we come to believe in gods, nations, and human rights; to trust money, books, and laws; and to be enslaved by bureaucracy, timetables, and consumerism? And what will our world be like in the millennia to come? In Sapiens, Professor Yuval Noah Harari spans the whole of human history, from the very first humans to walk the earth to the radical—and sometimes devastating—breakthroughs of the Cognitive, Agricultural, and Scientific Revolutions. Drawing on insights from biology, anthropology, paleontology, and economics, and incorporating full-color illustrations throughout the text, he explores how the currents of history have shaped our human societies, the animals and plants around us, and even our personalities. Have we become happier as history has unfolded? Can we ever free our behavior from the legacy of our ancestors? And what, if anything, can we do to influence the course of the centuries to come? Bold, wide-ranging, and provocative, Sapiens integrates history and science to challenge everything we thought we knew about being human: our thoughts, our actions, our heritage...and our future.	https://books.google.com/books/content?id=ibALnwEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
49	Atomic Habits	9780735211292	Penguin	2018		en	The #1 New York Times bestseller. Over 25 million copies sold! Translated into 60+ languages! Tiny Changes, Remarkable Results No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results. If you're having trouble changing your habits, the problem isn't you. The problem is your system. Bad habits repeat themselves again and again not because you don't want to change, but because you have the wrong system for change. You do not rise to the level of your goals. You fall to the level of your systems. Here, you'll get a proven system that can take you to new heights. Clear is known for his ability to distill complex topics into simple behaviors that can be easily applied to daily life and work. Here, he draws on the most proven ideas from biology, psychology, and neuroscience to create an easy-to-understand guide for making good habits inevitable and bad habits impossible. Along the way, readers will be inspired and entertained with true stories from Olympic gold medalists, award-winning artists, business leaders, life-saving physicians, and star comedians who have used the science of small habits to master their craft and vault to the top of their field. Learn how to: make time for new habits (even when life gets crazy); overcome a lack of motivation and willpower; design your environment to make success easier; get back on track when you fall off course; ...and much more. Atomic Habits will reshape the way you think about progress and success, and give you the tools and strategies you need to transform your habits--whether you are a team looking to win a championship, an organization hoping to redefine an industry, or simply an individual who wishes to quit smoking, lose weight, reduce stress, or achieve any other goal.	https://books.google.com/books/content?id=XfFvDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
50	Rich Dad Poor Dad	9781612680194		2017		en	April 2017 marks 20 years since Robert Kiyosaki's Rich Dad Poor Dad first made waves in the Personal Finance arena. It has since become the #1 Personal Finance book of all time... translated into dozens of languages and sold around the world. Rich Dad Poor Dad is Robert's story of growing up with two dads -- his real father and the father of his best friend, his rich dad -- and the ways in which both men shaped his thoughts about money and investing. The book explodes the myth that you need to earn a high income to be rich and explains the difference between working for money and having your money work for you. 20 Years... 20/20 Hindsight In the 20th Anniversary Edition of this classic, Robert offers an update on what we've seen over the past 20 years related to money, investing, and the global economy. Sidebars throughout the book will take readers "fast forward" -- from 1997 to today -- as Robert assesses how the principles taught by his rich dad have stood the test of time. In many ways, the messages of Rich Dad Poor Dad, messages that were criticized and challenged two decades ago, are more meaningful, relevant and important today than they were 20 years ago. As always, readers can expect that Robert will be candid, insightful... and continue to rock more than a few boats in his retrospective. Will there be a few surprises? Count on it. Rich Dad Poor Dad... * Explodes the myth that you need to earn a high income to become rich * Challenges the belief that your house is an asset * Shows parents why they can't rely on the school system to teach their kids about money * Defines once and for all an asset and a liability * Teaches you what to teach your kids about money for their future financial success	https://books.google.com/books/content?id=8QFwvgAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
51	The Power of Habit	9780812981605	Random House Trade Paperbacks	2014		en	NEW YORK TIMES BESTSELLER • MORE THAN 3 MILLION COPIES SOLD • This instant classic explores how we can change our lives by changing our habits. “Few [books] become essential manuals for business and living. The Power of Habit is an exception.”—Financial Times A WALL STREET JOURNAL AND FINANCIAL TIMES BEST BOOK OF THE YEAR In The Power of Habit, award-winning business reporter Charles Duhigg takes us to the thrilling edge of scientific discoveries that explain why habits exist and how they can be changed. Distilling vast amounts of information into engrossing narratives that take us from the boardrooms of Procter & Gamble to the sidelines of the NFL to the front lines of the civil rights movement, Duhigg presents a whole new understanding of human nature and its potential. At its core, The Power of Habit contains an exhilarating argument: The key to exercising regularly, losing weight, being more productive, and achieving success is understanding how habits work. As Duhigg shows, by harnessing this new science, we can transform our businesses, our communities, and our lives. With a new Afterword by the author	https://books.google.com/books/content?id=rrlPEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
52	Think and Grow Rich	9781585424337	National Geographic Books	2005		en	Think and Grow Rich has been called the "Granddaddy of All Motivational Literature." It was the first book to boldly ask, "What makes a winner?" The man who asked and listened for the answer, Napoleon Hill, is now counted in the top ranks of the world's winners himself.The most famous of all teachers of success spent "a fortune and the better part of a lifetime of effort" to produce the "Law of Success" philosophy that forms the basis of his books and that is so powerfully summarized in this one. In the original Think and Grow Rich, published in 1937, Hill draws on stories of Andrew Carnegie, Thomas Edison, Henry Ford, and other millionaires of his generation to illustrate his principles. In the updated version, Arthur R. Pell, Ph.D., a nationally known author, lecturer, and consultant in human resources management and an expert in applying Hill's thought, deftly interweaves anecdotes of how contemporary millionaires and billionaires, such as Bill Gates, Mary Kay Ash, Dave Thomas, and Sir John Templeton, achieved their wealth. Outmoded or arcane terminology and examples are faithfully refreshed to preclude any stumbling blocks to a new generation of readers.	https://books.google.com/books/content?id=SCiQEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
53	The 7 Habits of Highly Effective People	9780743269513	Free Press	2004		en	In The 7 Habits of Highly Effective People, author Stephen R. Covey presents a holistic, integrated, principle-centered approach for solving personal and professional problems. With penetrating insights and pointed anecdotes, Covey reveals a step-by-step pathway for living with fairness, integrity, service, and human dignity—principles that give us the security to adapt to change and the wisdom and power to take advantage of the opportunities that change creates.	https://books.google.com/books/content?id=8HvdtAEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
54	The Subtle Art of Not Giving a F**k	9780062457714	HarperOne	2016		en		https://books.google.com/books/content?id=RobZjgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
55	Ikigai	9780143130727	Penguin	2017		en	INTERNATIONAL BESTSELLER • 2 MILLION+ COPIES SOLD WORLDWIDE “Workers looking for more fulfilling positions should start by identifying their ikigai.” ―Business Insider “One of the unintended—yet positive—consequences of the [pandemic] is that it is forcing people to reevaluate their jobs, careers, and lives. Use this time wisely, find your personal ikigai, and live your best life.” ―Forbes Find your ikigai (pronounced ee-key-guy) to live longer and bring more meaning and joy to all your days. “Only staying active will make you want to live a hundred years.” —Japanese proverb According to the Japanese, everyone has an ikigai—a reason for living. And according to the residents of the Japanese village with the world’s longest-living people, finding it is the key to a happier and longer life. Having a strong sense of ikigai—where what you love, what you’re good at, what you can get paid for, and what the world needs all overlap—means that each day is infused with meaning. It’s the reason we get up in the morning. It’s also the reason many Japanese never really retire (in fact there’s no word in Japanese that means retire in the sense it does in English): They remain active and work at what they enjoy, because they’ve found a real purpose in life—the happiness of always being busy. In researching this book, the authors interviewed the residents of the Japanese village with the highest percentage of 100-year-olds—one of the world’s Blue Zones. Ikigai reveals the secrets to their longevity and happiness: how they eat, how they move, how they work, how they foster collaboration and community, and—their best-kept secret—how they find the ikigai that brings satisfaction to their lives. And it provides practical tools to help you discover your own ikigai. Because who doesn’t want to find happiness in every day? What’s your ikigai?	https://books.google.com/books/content?id=CbouDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
56	Start with Why	9781591846444	Penguin	2011		en	The inspirational bestseller that ignited a movement and asked us to find our WHY Discover the book that is captivating millions on TikTok and that served as the basis for one of the most popular TED Talks of all time—with more than 56 million views and counting. Over a decade ago, Simon Sinek started a movement that inspired millions to demand purpose at work, to ask what was the WHY of their organization. Since then, millions have been touched by the power of his ideas, and these ideas remain as relevant and timely as ever. START WITH WHY asks (and answers) the questions: why are some people and organizations more innovative, more influential, and more profitable than others? Why do some command greater loyalty from customers and employees alike? Even among the successful, why are so few able to repeat their success over and over? People like Martin Luther King Jr., Steve Jobs, and the Wright Brothers had little in common, but they all started with WHY. They realized that people won't truly buy into a product, service, movement, or idea until they understand the WHY behind it. START WITH WHY shows that the leaders who have had the greatest influence in the world all think, act and communicate the same way—and it's the opposite of what everyone else does. Sinek calls this powerful idea The Golden Circle, and it provides a framework upon which organizations can be built, movements can be led, and people can be inspired. And it all starts with WHY.	https://books.google.com/books/content?id=fkOKDQAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
57	Deep Work	9781455586691	Grand Central Publishing	2016		en	Read the Wall Street Journal Bestseller for "cultivating intense focus" for fast, powerful performance results for achieving success and true meaning in one's professional life (Adam Grant, author of Give and Take). Deep work is the ability to focus without distraction on a cognitively demanding task. It's a skill that allows you to quickly master complicated information and produce better results in less time. Deep work will make you better at what you do and provide the sense of true fulfillment that comes from craftsmanship. In short, deep work is like a super power in our increasingly competitive twenty-first century economy. And yet, most people have lost the ability to go deep-spending their days instead in a frantic blur of e-mail and social media, not even realizing there's a better way. In DEEP WORK, author and professor Cal Newport flips the narrative on impact in a connected age. Instead of arguing distraction is bad, he instead celebrates the power of its opposite. Dividing this book into two parts, he first makes the case that in almost any profession, cultivating a deep work ethic will produce massive benefits. He then presents a rigorous training regimen, presented as a series of four "rules," for transforming your mind and habits to support this skill. 1. Work Deeply2. Embrace Boredom 3. Quit Social Media4. Drain the Shallows A mix of cultural criticism and actionable advice, DEEP WORK takes the reader on a journey through memorable stories-from Carl Jung building a stone tower in the woods to focus his mind, to a social media pioneer buying a round-trip business class ticket to Tokyo to write a book free from distraction in the air-and no-nonsense advice, such as the claim that most serious professionals should quit social media and that you should practice being bored. DEEP WORK is an indispensable guide to anyone seeking focused success in a distracted world. An Amazon Best Book of 2016 Pick in Business & LeadershipWall Street Journal Business BestsellerA Business Book of the Week at 800-CEO-READ	https://books.google.com/books/content?id=foeNrgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
58	Clean Code	9780132350884	Pearson Education	2009		en	This title shows the process of cleaning code. Rather than just illustrating the end result, or just the starting and ending state, the author shows how several dozen seemingly small code changes can positively impact the performance and maintainability of an application code base.	https://books.google.com/books/content?id=hjEFCAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
59	The Pragmatic Programmer	9780135957059	Addison-Wesley Professional	2019		en	Using anecdotes, analogies, examples and parables, this user-friendly guide offers techniques for getting any programming job done effectively, and can help any programmer improve skills, no matter what level. Incorporates today's top languages, including Java, C, C++, and Perl.	https://books.google.com/books/content?id=sNeFxAEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
60	Introduction to Algorithms, third edition	9780262033848	MIT Press	2009		en	The latest edition of the essential text and professional reference, with substantial new material on such topics as vEB trees, multithreaded algorithms, dynamic programming, and edge-based flow. Some books on algorithms are rigorous but incomplete; others cover masses of material but lack rigor. Introduction to Algorithms uniquely combines rigor and comprehensiveness. The book covers a broad range of algorithms in depth, yet makes their design and analysis accessible to all levels of readers. Each chapter is relatively self-contained and can be used as a unit of study. The algorithms are described in English and in a pseudocode designed to be readable by anyone who has done a little programming. The explanations have been kept elementary without sacrificing depth of coverage or mathematical rigor. The first edition became a widely used text in universities worldwide as well as the standard reference for professionals. The second edition featured new chapters on the role of algorithms, probabilistic analysis and randomized algorithms, and linear programming. The third edition has been revised and updated throughout. It includes two completely new chapters, on van Emde Boas trees and multithreaded algorithms, substantial additions to the chapter on recurrence (now called “Divide-and-Conquer”), and an appendix on matrices. It features improved treatment of dynamic programming and greedy algorithms and a new notion of edge-based flow in the material on flow networks. Many exercises and problems have been added for this edition. The international paperback edition is no longer available; the hardcover is available worldwide.	https://books.google.com/books/content?id=i-bUBQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api
61	Design Patterns	9780201633610	Pearson Deutschland GmbH	1995		en	Software -- Software Engineering.	https://books.google.com/books/content?id=jUvf7wMUGcUC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api
64	Python Crash Course, 2nd Edition	9781593279288	No Starch Press	2019		en	The best-selling Python book in the world, with over 1 million copies sold! A fast-paced, no-nonsense, updated guide to programming in Python. If you've been thinking about learning how to code or picking up Python, this internationally bestselling guide to the most popular programming language is your quickest, easiest way to get started and go! Even if you have no experience whatsoever, Python Crash Course, 2nd Edition, will have you writing programs, solving problems, building computer games, and creating data visualizations in no time. You’ll begin with basic concepts like variables, lists, classes, and loops—with the help of fun skill-strengthening exercises for every topic—then move on to making interactive programs and best practices for testing your code. Later chapters put your new knowledge into play with three cool projects: a 2D Space Invaders-style arcade game, a set of responsive data visualizations you’ll build with Python's handy libraries (Pygame, Matplotlib, Plotly, Django), and a customized web app you can deploy online. Why wait any longer? Start your engine and code!	https://books.google.com/books/content?id=w1v6DwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api
65	The Da Vinci Code	9780307474278	Anchor	2009		en	#1 WORLDWIDE BESTSELLER • While in Paris, Harvard symbologist Robert Langdon is awakened by a phone call in the dead of the night. The elderly curator of the Louvre has been murdered inside the museum, his body covered in baffling symbols. “Blockbuster perfection.... A gleefully erudite suspense novel.” —The New York Times “A pulse-quickening, brain-teasing adventure.” —People As Langdon and gifted French cryptologist Sophie Neveu sort through the bizarre riddles, they are stunned to discover a trail of clues hidden in the works of Leonardo da Vinci—clues visible for all to see and yet ingeniously disguised by the painter. Even more startling, the late curator was involved in the Priory of Sion—a secret society whose members included Sir Isaac Newton, Victor Hugo, and Da Vinci—and he guarded a breathtaking historical secret. Unless Langdon and Neveu can decipher the labyrinthine puzzle—while avoiding the faceless adversary who shadows their every move—the explosive, ancient truth will be lost forever.	https://books.google.com/books/content?id=YuDl2Wl651AC&printsec=frontcover&img=1&zoom=1&source=gbs_api
66	Angels & Demons	9781416524793	Pocket Books	2006		en	The explosive Robert Langdon thriller from Dan Brown, the #1 New York Times bestselling author of The Da Vinci Code and Inferno—now a major film directed by Ron Howard and starring Tom Hanks and Felicity Jones. Angels & Demons careens from enlightening epiphanies to dark truths as the battle between science and religion turns to war. This is the book that started it all: we meet Robert Langdon for the first time, caught up in a race against time to find an apocalyptic time-bomb, planted by an ancient secret society that has surfaced to carry out its ultimate threat: to destroy the Vatican.	https://books.google.com/books/content?id=ENlhNnYhQEMC&printsec=frontcover&img=1&zoom=1&source=gbs_api
67	The Book Thief	9780375842207	Knopf Books for Young Readers	2007		en	Trying to make sense of the horrors of World War II, Death is fascinated by one young girl, Liesel, whose book-stealing and story-telling talents help sustain her community, especially her family and the Jewish man they are hiding.	https://books.google.com/books/content?id=_MnZAAAAMAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
68	The Shining	9780307743657	Vintage	2012		en	#1 NEW YORK TIMES BESTSELLER • ONE OF TIME MAGAZINE'S 100 BEST MYSTERY AND THRILLER BOOKS OF ALL TIME • Before Doctor Sleep, there was The Shining, a classic of modern American horror. Jack Torrance takes a job as the caretaker of the remote Overlook Hotel. As the brutal winter sets in, the hotel's dark secrets begin to unravel. “An undisputed master of suspense and terror.” —The Washington Post Jack Torrance’s new job at the Overlook Hotel is the perfect chance for a fresh start. As the off-season caretaker at the atmospheric old hotel, he’ll have plenty of time to spend reconnecting with his family and working on his writing. But as the harsh winter weather sets in, the idyllic location feels ever more remote . . . and more sinister. And the only one to notice the strange and terrible forces gathering around the Overlook is Danny Torrance, a uniquely gifted five-year-old.	https://books.google.com/books/content?id=c2VHVEWUFoQC&printsec=frontcover&img=1&zoom=1&source=gbs_api
69	Gone Girl	9780307588371	Ballantine Books	2014		en	#1 NEW YORK TIMES BESTSELLER • The “mercilessly entertaining” (Vanity Fair) instant classic “about the nature of identity and the terrible secrets that can survive and thrive in even the most intimate relationships” (Lev Grossman, Time “One of the Best Books of the Decade”)—now featuring never-before-published deleted scenes ONE OF TIME'S 100 BEST MYSTERY AND THRILLER BOOKS OF ALL TIME, ONE OF CNN'S MOST INFLUENTIAL BOOKS OF THE DECADE, AND ONE OF ENTERTAINMENT WEEKLY'S BEST BOOKS OF THE DECADE ONE OF THE TEN BEST BOOKS OF THE YEAR: Janet Maslin, The New York Times, People, Entertainment Weekly, O: The Oprah Magazine, Slate, Kansas City Star, USA Today, Christian Science Monitor New York Times Readers Pick: 100 Best Books of the 21st Century On a warm summer morning in North Carthage, Missouri, it is Nick and Amy Dunne’s fifth wedding anniversary. Presents are being wrapped and reservations are being made when Nick’s clever and beautiful wife disappears. Husband-of-the-Year Nick isn’t doing himself any favors with cringe-worthy daydreams about the slope and shape of his wife’s head, but passages from Amy's diary reveal the alpha-girl perfectionist could have put anyone dangerously on edge. Under mounting pressure from the police and the media—as well as Amy’s fiercely doting parents—the town golden boy parades an endless series of lies, deceits, and inappropriate behavior. Nick is oddly evasive, and he’s definitely bitter—but is he really a killer? ONE OF THE BEST BOOKS OF THE YEAR: San Francisco Chronicle, St. Louis Post-Dispatch, The Chicago Tribune, HuffPost, Newsday	https://books.google.com/books/content?id=mmWODQAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
70	The Girl with the Dragon Tattoo	9780307454546	Vintage Crime/Black Lizard	2009		en	ONE OF TIME MAGAZINE'S 100 BEST MYSTERY AND THRILLER BOOKS OF ALL TIME • #1 NATIONAL BESTSELLER • The thrilling first book in the Girl with the Dragon Tattoo series featuring Lisbeth Salander: “Combine the chilly Swedish backdrop and moody psychodrama of a Bergman movie with the grisly pyrotechnics of a serial-killer thriller, then add an angry punk heroine and a down-on-his-luck investigative journalist, and you have the ingredients of Stieg Larsson’s first novel” (The New York Times). • Also known as the Millennium series Harriet Vanger, a scion of one of Sweden's wealthiest families disappeared over forty years ago. All these years later, her aged uncle continues to seek the truth. He hires Mikael Blomkvist, a crusading journalist recently trapped by a libel conviction, to investigate. He is aided by the pierced and tattooed punk prodigy Lisbeth Salander. Together they tap into a vein of unfathomable iniquity and astonishing corruption. Look for the latest book in the Girl with the Dragon Tattoo series, The Girl in the Eagle's Talons!	https://books.google.com/books/content?id=o53ilir4yXcC&printsec=frontcover&img=1&zoom=1&source=gbs_api
71	World War Z	9780307346605	Crown	2006		en	#1 NEW YORK TIMES BESTSELLER • “Prepare to be entranced by this addictively readable oral history of the great war between humans and zombies.”—Entertainment Weekly We survived the zombie apocalypse, but how many of us are still haunted by that terrible time? We have (temporarily?) defeated the living dead, but at what cost? Told in the haunting and riveting voices of the men and women who witnessed the horror firsthand, World War Z is the only record of the pandemic. The Zombie War came unthinkably close to eradicating humanity. Max Brooks, driven by the urgency of preserving the acid-etched first-hand experiences of the survivors, traveled across the United States of America and throughout the world, from decimated cities that once teemed with upwards of thirty million souls to the most remote and inhospitable areas of the planet. He recorded the testimony of men, women, and sometimes children who came face-to-face with the living, or at least the undead, hell of that dreadful time. World War Z is the result. Never before have we had access to a document that so powerfully conveys the depth of fear and horror, and also the ineradicable spirit of resistance, that gripped human society through the plague years. THE INSPIRATION FOR THE MAJOR MOTION PICTURE “Will spook you for real.”—The New York Times Book Review “Possesses more creativity and zip than entire crates of other new fiction titles. Think Mad Max meets The Hot Zone. . . . It’s Apocalypse Now, pandemic-style. Creepy but fascinating.”—USA Today “Will grab you as tightly as a dead man’s fist. A.”—Entertainment Weekly, EW Pick “Probably the most topical and literate scare since Orson Welles’s War of the Worlds radio broadcast . . . This is action-packed social-political satire with a global view.”—Dallas Morning News	https://books.google.com/books/content?id=km1lAAAAMAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
72	The American Civil War	9780307274939	National Geographic Books	2010		en	The greatest military historian of our time gives a peerless account of America’s most bloody, wrenching, and eternally fascinating war. In this magesterial history and national bestseller, John Keegan shares his original and perceptive insights into the psychology, ideology, demographics, and economics of the American Civil War. Illuminated by Keegan’s knowledge of military history he provides a fascinating look at how command and the slow evolution of its strategic logic influenced the course of the war. Above all, The American Civil War gives an intriguing account of how the scope of the conflict combined with American geography to present a uniquely complex and challenging battle space. Irresistibly written and incisive in its analysis, this is an indispensable account of America’s greatest conflict.	https://books.google.com/books/content?id=1OeMEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
73	Carrie	9780307743664	Vintage	2011		en	#1 NEW YORK TIMES BESTSELLER • 50TH ANNIVERSARY EDITION WITH A NEW INTRODUCTION BY MARGARET ATWOOD • Stephen King's legendary debut, the bestselling smash hit that put him on the map as one of America's favorite writers • In a world where bullies rule, one girl holds a secret power. Unpopular and tormented, Carrie White's life takes a terrifying turn when her hidden abilities become a weapon of horror. "Stephen King’s first novel changed the trajectory of horror fiction forever. Fifty years later, authors say it’s still challenging and guiding the genre." —Esquire “A master storyteller.” —The Los Angeles Times • “Guaranteed to chill you.” —The New York Times • "Gory and horrifying. . . . You can't put it down." —Chicago Tribune Unpopular at school and subjected to her mother's religious fanaticism at home, Carrie White does not have it easy. But while she may be picked on by her classmates, she has a gift she's kept secret since she was a little girl: she can move things with her mind. Doors lock. Candles fall. Her ability has been both a power and a problem. And when she finds herself the recipient of a sudden act of kindness, Carrie feels like she's finally been given a chance to be normal. She hopes that the nightmare of her classmates' vicious taunts is over . . . but an unexpected and cruel prank turns her gift into a weapon of horror so destructive that the town may never recover.	https://books.google.com/books/content?id=TA5X7-sC54AC&printsec=frontcover&img=1&zoom=1&source=gbs_api
74	Midnight Lies	9780345538390	Ballantine Books	2013		en	The Wilde sisters of Midnight return in this thrilling novel of romantic suspense, perfect for fans of Maya Banks, Allison Brennan, and Lori Foster. IT’S ALWAYS HOTTER AT MIDNIGHT. The winds of fate have blown cruelly on a family that once had it all: money, power, prestige. The lives of three beautiful daughters were forever changed when, on a sultry night in Midnight, Alabama, a murder-suicide shattered the Wilde family. The girls grew up to live separate lives but now have returned home, each to face a danger no one can see coming. Former homecoming queen Samantha surprised everyone by going into law enforcement, but beneath her tough façade lies a wary heart. The tragedy that struck her family is an ever-present reminder that nothing is ever as it seems. When the man she loves, Quinn Braddock, a doctor and Iraq war veteran, is accused of murder, Samantha assumes the worst. Brokenhearted, her confidence shattered, she returns to Midnight. Though exonerated, Quinn still feels the sting of Samantha’s doubt, but he can’t forget his feelings for her and follows her. Soon after his arrival, a shocking murder terrifies the town, and once again, Quinn is under suspicion. This time, Samantha will not turn her back on the man she loves—even if it means walking into a killer’s trap. Praise for Midnight Lies “A fine example of romantic suspense, with an alpha hero who has a sensitive side, a tough and feisty heroine who sometimes acts like a damsel waiting to be swept off her feet, and plenty of twists and turns. Fans of the genre will be well pleased.”—Publishers Weekly “Grace crafts a very readable, steamy suspense plot.”—RT Book Reviews “An enjoyable read . . . quality romantic suspense.”—Fresh Fiction “A strong entry in a fine series . . . I’m looking forward to the next Wilde adventure in Midnight!”—Night Owl Reviews “If you are a romance suspense fan, Midnight Lies is a must read.”—A Tasty Read Book Reviews	https://books.google.com/books/content?id=v2iPDQAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
75	Midnight Secrets	9780345538383	Ballantine Books	2013		en	For fans of Maya Banks, Allison Brennan, and Lori Foster, a thrilling new romantic suspense novel from Ella Grace AT THE STROKE OF MIDNIGHT, THE HEAT BEGINS On a hot southern night, with a storm on the horizon, a family is shattered. Three beautiful daughters—Savannah, Samantha, and Sabrina Wilde—go on with their lives, each significantly changed, as they bear the memory of the murder-suicide that killed their parents. For years, they have stayed away from Midnight, Alabama. Until Midnight calls them home. Savannah is the first one back, when a grueling case in Nashville leads the young prosecutor to seek shelter in the quiet of the once grand Wilde mansion. But when she finds letters casting doubt on her family’s dark, shameful past, she realizes that peace in Midnight is a shallow façade and sinister secrets lurk beneath the surface. Zach Tanner, once the town’s bad boy, is now the new police chief and still has a wild hold over her. Zach can feel it, too, but he hurt Savannah once. As teenagers, they broke every rule together. Now it’s his job to keep her safe, even though he isn’t sure who her enemies are—or which ones might be his own. Praise for Midnight Secrets “[Ella] Grace accents this tale with plenty of small-town flavor as regret and dangerous secrets threaten deadly consequences. Good stuff!”—RT Book Reviews “An entertaining romantic suspense tale [that] combines an attractive small town setting with [a] chilling murder mystery.”—Night Owl Romance “Good, solid romantic suspense as written by one of the best in the business.”—Fresh Fiction “This kickoff novel sets a high standard for the series.”—Kirkus Reviews “This is a strong start to what promises to be a really good series. The romance was utterly satisfying, the suspense creepy enough, the mystery puzzling and the Southern setting appropriate to the story.”—The Book Nympho	https://books.google.com/books/content?id=5e9tFXVKrS8C&printsec=frontcover&img=1&zoom=1&source=gbs_api
76	The Hobbit / The Lord of the Rings	9780345538376	National Geographic Books	2012		en	Presents a box set including the complete "Lord of the Rings" trilogy, as well as its prequel, "The Hobbit."	https://books.google.com/books/content?id=XBaNEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
77	The Hobbit	9780345339683	Del Rey	1986		en	The stirring adventure that begins The Lord of the Rings, the greatest fantasy epic of all time When Thorin Oakenshield and his band of dwarves embark upon a dangerous quest to reclaim the hoard of gold stolen from them by the evil dragon Smaug, Gandalf the wizard suggests an unlikely accomplice: Bilbo Baggins, an unassuming Hobbit dwelling in peaceful Hobbiton. Along the way, the company faces trolls, goblins, giant spiders, and worse. But as they journey from the wonders of Rivendell to the terrors of Mirkwood and beyond, Bilbo will find that there is more to him than anyone—himself included—ever dreamed. Unexpected qualities of courage and cunning, and a love of adventure, propel Bilbo toward his great destiny . . . a destiny that waits in the dark caverns beneath the Misty Mountains, where a twisted creature known as Gollum jealously guards a precious magic ring.	
78	A Game of Thrones	9780553573404	Random House Worlds	1997		en	NOW THE ACCLAIMED HBO SERIES GAME OF THRONES—THE MASTERPIECE THAT BECAME A CULTURAL PHENOMENON Here is the first book in the landmark series that has redefined imaginative fiction and become a modern masterpiece. A GAME OF THRONES In a land where summers can last decades and winters a lifetime, trouble is brewing. The cold is returning, and in the frozen wastes to the North of Winterfell, sinister and supernatural forces are massing beyond the kingdom’s protective Wall. At the center of the conflict lie the Starks of Winterfell, a family as harsh and unyielding as the land they were born to. Sweeping from a land of brutal cold to a distant summertime kingdom of epicurean plenty, here is a tale of lords and ladies, soldiers and sorcerers, assassins and bastards, who come together in a time of grim omens. Amid plots and counterplots, tragedy and betrayal, victory and terror, the fate of the Starks, their allies, and their enemies hangs perilously in the balance, as each endeavors to win that deadliest of conflicts: the game of thrones. A GAME OF THRONES • A CLASH OF KINGS • A STORM OF SWORDS • A FEAST FOR CROWS • A DANCE WITH DRAGONS	https://books.google.com/books/content?id=bIZiAAAAMAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
79	A Storm of Swords	9780553573428	National Geographic Books	2003		en	THE BOOK BEHIND THE THIRD SEASON OF GAME OF THRONES, AN ORIGINAL SERIES NOW ON HBO. Here is the third volume in George R. R. Martin’s magnificent cycle of novels that includes A Game of Thrones and A Clash of Kings. As a whole, this series comprises a genuine masterpiece of modern fantasy, bringing together the best the genre has to offer. Magic, mystery, intrigue, romance, and adventure fill these pages and transport us to a world unlike any we have ever experienced. Already hailed as a classic, George R. R. Martin’s stunning series is destined to stand as one of the great achievements of imaginative fiction. A STORM OF SWORDS Of the five contenders for power, one is dead, another in disfavor, and still the wars rage as violently as ever, as alliances are made and broken. Joffrey, of House Lannister, sits on the Iron Throne, the uneasy ruler of the land of the Seven Kingdoms. His most bitter rival, Lord Stannis, stands defeated and disgraced, the victim of the jealous sorceress who holds him in her evil thrall. But young Robb, of House Stark, still rules the North from the fortress of Riverrun. Robb plots against his despised Lannister enemies, even as they hold his sister hostage at King’s Landing, the seat of the Iron Throne. Meanwhile, making her way across a blood-drenched continent is the exiled queen, Daenerys, mistress of the only three dragons still left in the world. . . . But as opposing forces maneuver for the final titanic showdown, an army of barbaric wildlings arrives from the outermost line of civilization. In their vanguard is a horde of mythical Others--a supernatural army of the living dead whose animated corpses are unstoppable. As the future of the land hangs in the balance, no one will rest until the Seven Kingdoms have exploded in a veritable storm of swords. . . .	https://books.google.com/books/content?id=sgmOEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
80	The Hobbit	9780547928241	William Morrow	2012		en	The adventures of the well-to-do hobbit, Bilbo Baggins, who lived happily in his comfortable home until a wandering wizard granted his wish.	https://books.google.com/books/content?id=RXPjuQAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
81	The Art of the Hobbit by J.R.R. Tolkien	9780547928258	William Morrow	2012		en	Analyzes and illuminates Tolkien's lesser-known achievements as an artist and collects the complete artwork created for "The Hobbit, " including over one hundred sketches, paintings, maps, and plans.	https://books.google.com/books/content?id=suruuQAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
82	Harry Potter	9780439136365		1998		en		https://books.google.com/books/content?id=p-W7qWMJUasC&printsec=frontcover&img=1&zoom=1&source=gbs_api
83	Harry Potter	9780439358071		2008		en	Collects the complete series that relates the adventures of young Harry Potter, who attends Hogwarts School of Witchcraft and Wizardry, where he and others of his kind learn their craft.	
84	The Odyssey	9780143039952	Penguin Classics	2006		en	When Robert Fagles' translation of the Iliad was published in 199, critics and scholars alike hailed it as a masterpiece. Now one of the great translators of our time presents us with the Odyssey, Homer's best-loved poem, recounting Odysseus' wanderings after the Trojan War. With wit and wile, the 'man of twists and turns' meets the challenges of gods and monsters, only to return after twenty years to a home besieged by his wife's suitors. In the myths and legends retold in this immortal poem, Fagles has captured the energy of Homer's original in a bold, contemporary idiom.	https://books.google.com/books/content?id=EPftAAAAMAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
85	Norse Mythology	9780393356182	National Geographic Books	2018		en	Neil Gaiman, long inspired by ancient mythology in creating the fantastical realms of his fiction, presents a bravura rendition of the Norse gods and their world from their origin though their upheaval in Ragnarok. In Norse Mythology, Gaiman stays true to the myths in envisioning the major Norse pantheon: Odin, the highest of the high, wise, daring, and cunning; Thor, Odin’s son, incredibly strong yet not the wisest of gods; and Loki—son of a giant—blood brother to Odin and a trickster and unsurpassable manipulator. Gaiman fashions these primeval stories into a novelistic arc that begins with the genesis of the legendary nine worlds and delves into the exploits of deities, dwarfs, and giants. Through Gaiman’s deft and witty prose, these gods emerge with their fiercely competitive natures, their susceptibility to being duped and to duping others, and their tendency to let passion ignite their actions, making these long-ago myths breathe pungent life again.	https://books.google.com/books/content?id=WF2NEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
86	Eat Pray Love	9780143038412	Penguin	2007		en	One of the most iconic, beloved, and bestselling books of our time from the bestselling author of City of Girls and Big Magic, Elizabeth Gilbert. Elizabeth Gilbert’s Eat Pray Love touched the world and changed countless lives, inspiring and empowering millions of readers to search for their own best selves. Now, this beloved and iconic book returns in a beautiful 10th anniversary edition, complete with an updated introduction from the author, to launch a whole new generation of fans. In her early thirties, Elizabeth Gilbert had everything a modern American woman was supposed to want—husband, country home, successful career—but instead of feeling happy and fulfilled, she was consumed by panic and confusion. This wise and rapturous book is the story of how she left behind all these outward marks of success, and set out to explore three different aspects of her nature, against the backdrop of three different cultures: pleasure in Italy, devotion in India, and on the Indonesian island of Bali, a balance between worldly enjoyment and divine transcendence.	https://books.google.com/books/content?id=zquLDQAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
87	I Am a Strange Loop	9780465030798	Basic Books	2008		en	One of our greatest philosophers and scientists of the mind asks, where does the self come from--and how our selves can exist in the minds of others. Can thought arise out of matter? Can self, soul, consciousness, "I" arise out of mere matter? If it cannot, then how can you or I be here? I Am a Strange Loop argues that the key to understanding selves and consciousness is the "strange loop"-a special kind of abstract feedback loop inhabiting our brains. The most central and complex symbol in your brain is the one called "I." The "I" is the nexus in our brain, one of many symbols seeming to have free will and to have gained the paradoxical ability to push particles around, rather than the reverse. How can a mysterious abstraction be real-or is our "I" merely a convenient fiction? Does an "I" exert genuine power over the particles in our brain, or is it helplessly pushed around by the laws of physics? These are the mysteries tackled in I Am a Strange Loop, Douglas Hofstadter's first book-length journey into philosophy since Gödel, Escher, Bach. Compulsively readable and endlessly thought-provoking, this is a moving and profound inquiry into the nature of mind.	https://books.google.com/books/content?id=78S6swEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
88	Getting Things Done	9780143126560	Penguin	2015		en	The book Lifehack calls "The Bible of business and personal productivity." "A completely revised and updated edition of the blockbuster bestseller from 'the personal productivity guru'"—Fast Company Since it was first published almost fifteen years ago, David Allen’s Getting Things Done has become one of the most influential business books of its era, and the ultimate book on personal organization. “GTD” is now shorthand for an entire way of approaching professional and personal tasks, and has spawned an entire culture of websites, organizational tools, seminars, and offshoots. Allen has rewritten the book from start to finish, tweaking his classic text with important perspectives on the new workplace, and adding material that will make the book fresh and relevant for years to come. This new edition of Getting Things Done will be welcomed not only by its hundreds of thousands of existing fans but also by a whole new generation eager to adopt its proven principles.	https://books.google.com/books/content?id=ebNDDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
89	Guns, Germs, and Steel	9780393354324	National Geographic Books	2017		en	Winner of the Pulitzer Prize • New York Times Bestseller • Over Two Million Copies Sold “One of the most significant projects embarked upon by any intellectual of our generation” (Gregg Easterbrook, New York Times), Guns, Germs, and Steel presents a groundbreaking, unified narrative of human history. Why did Eurasians conquer, displace, or decimate Native Americans, Australians, and Africans, instead of the reverse? In this “artful, informative, and delightful” (William H. McNeill, New York Review of Books) book, a classic of our time, evolutionary biologist Jared Diamond dismantles racist theories of human history by revealing the environmental factors actually responsible for its broadest patterns. The story begins 13,000 years ago, when Stone Age hunter-gatherers constituted the entire human population. Around that time, the developmental paths of human societies on different continents began to diverge greatly. Early domestication of wild plants and animals in the Fertile Crescent, China, Mesoamerica, the Andes, and other areas gave peoples of those regions a head start at a new way of life. But the localized origins of farming and herding proved to be only part of the explanation for their differing fates. The unequal rates at which food production spread from those initial centers were influenced by other features of climate and geography, including the disparate sizes, locations, and even shapes of the continents. Only societies that moved away from the hunter-gatherer stage went on to develop writing, technology, government, and organized religions as well as deadly germs and potent weapons of war. It was those societies, adventuring on sea and land, that invaded others, decimating native inhabitants through slaughter and the spread of disease. A major landmark in our understanding of human societies, Guns, Germs, and Steel chronicles the way in which the modern world, and its inequalities, came to be.	https://books.google.com/books/content?id=hFyNEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
90	The Body Keeps the Score	9780143127741	Penguin Books	2015		en	Originally published by Viking Penguin, 2014.	https://books.google.com/books/content?id=vHnZCwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
91	A Gentleman in Moscow	9780143110439	Penguin	2019		en	The mega-bestseller with more than 2 million readers • A New York Times “Readers’ Choice: Best Books of the 21st Century” Pick From the #1 New York Times-bestselling author of The Lincoln Highway and Table for Two, a beautifully transporting novel about a man who is ordered to spend the rest of his life inside a luxury hotel In 1922, Count Alexander Rostov is deemed an unrepentant aristocrat by a Bolshevik tribunal, and is sentenced to house arrest in the Metropol, a grand hotel across the street from the Kremlin. Rostov, an indomitable man of erudition and wit, has never worked a day in his life, and must now live in an attic room while some of the most tumultuous decades in Russian history are unfolding outside the hotel’s doors. Unexpectedly, his reduced circumstances provide him entry into a much larger world of emotional discovery. Brimming with humor, a glittering cast of characters, and one beautifully rendered scene after another, this singular novel casts a spell as it relates the count’s endeavor to gain a deeper understanding of what it means to be a man of purpose.	https://books.google.com/books/content?id=-9CLDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
92	Dune	9780143111580	Penguin	2016		en	• DUNE: PART TWO • THE MAJOR MOTION PICTURE Directed by Denis Villeneuve, screenplay by Denis Villeneuve and Jon Spaihts, based on the novel Dune by Frank Herbert • Starring Timothée Chalamet, Zendaya, Rebecca Ferguson, Josh Brolin, Austin Butler, Florence Pugh, Dave Bautista, Christopher Walken, Stephen McKinley Henderson, Léa Seydoux, with Stellan Skarsgård, with Charlotte Rampling, and Javier Bardem A deluxe hardcover edition of the best-selling science-fiction book of all time—part of Penguin Galaxy, a collectible series of six sci-fi/fantasy classics, featuring a series introduction by Neil Gaiman Winner of the AIGA + Design Observer 50 Books | 50 Covers competition Science fiction’s supreme masterpiece, Dune will be forever considered a triumph of the imagination. Set on the desert planet Arrakis, it is the story of the boy Paul Atreides, who will become the mysterious man known as Muad’Dib. Paul’s noble family is named stewards of Arrakis, whose sands are the only source of a powerful drug called “the spice.” After his family is brought down in a traitorous plot, Paul must go undercover to seek revenge, and to bring to fruition humankind’s most ancient and unattainable dream. A stunning blend of adventure and mysticism, environmentalism and politics, Dune won the first Nebula Award, shared the Hugo Award, and formed the basis of what is undoubtedly the grandest epic in science fiction. Penguin Galaxy Six of our greatest masterworks of science fiction and fantasy, in dazzling collector-worthy hardcover editions, and featuring a series introduction by #1 New York Times bestselling author Neil Gaiman, Penguin Galaxy represents a constellation of achievement in visionary fiction, lighting the way toward our knowledge of the universe, and of ourselves. From historical legends to mythic futures, monuments of world-building to mind-bending dystopias, these touchstones of human invention and storytelling ingenuity have transported millions of readers to distant realms, and will continue for generations to chart the frontiers of the imagination. The Once and Future King by T. H. White Stranger in a Strange Land by Robert A. Heinlein Dune by Frank Herbert 2001: A Space Odyssey by Arthur C. Clarke The Left Hand of Darkness by Ursula K. Le Guin Neuromancer by William Gibson For more than seventy years, Penguin has been the leading publisher of classic literature in the English-speaking world. With more than 1,700 titles, Penguin Classics represents a global bookshelf of the best works throughout history and across genres and disciplines. Readers trust the series to provide authoritative texts enhanced by introductions and notes by distinguished scholars and contemporary authors, as well as up-to-date translations by award-winning translators.	https://books.google.com/books/content?id=ydQiDQAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
93	Everything and More: A Compact History of Infinity	9780393339284	W. W. Norton & Company	2010		en	The bestselling author of "Infinite Jest" takes on the 2,000 year-old quest to understand infinity. Wallace brings his considerable talents to the history of one of math's most enduring puzzles: the seemingly paradoxical nature of infinity.	https://books.google.com/books/content?id=kXI0AAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api
94	The Elegant Universe: Superstrings, Hidden Dimensions, and the Quest for the Ultimate Theory	9780393338102	W. W. Norton & Company	2010		en	Introduces the superstring theory that attempts to unite general relativity and quantum mechanics.	https://books.google.com/books/content?id=jYHtp6kx8qgC&printsec=frontcover&img=1&zoom=1&source=gbs_api
95	Six Easy Pieces	9780465025275	Basic Books	2011		en	"If one book was all that could be passed on to the next generation of scientists it would undoubtedly have to be Six Easy Pieces."- John Gribbin, New Scientist It was Richard Feynman's outrageous and scintillating method of teaching that earned him legendary status among students and professors of physics. From 1961 to 1963, Feynman delivered a series of lectures at the California Institute of Technology that revolutionized the teaching of physics around the world. Six Easy Pieces, taken from these famous Lectures on Physics, represent the most accessible material from the series. In these classic lessons, Feynman introduces the general reader to the following topics: atoms, basic physics, energy, gravitation, quantum mechanics, and the relationship of physics to other topics. With his dazzling and inimitable wit, Feynman presents each discussion with a minimum of jargon. Filled with wonderful examples and clever illustrations, Six Easy Pieces is the ideal introduction to the fundamentals of physics by one of the most admired and accessible physicists of modern times.	https://books.google.com/books/content?id=yG7EtAEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
96	Crime and Punishment	9780140449136	Penguin UK	2003		en	This classic, begun as a novel concerned with the psychology of a crime and the process of guilt, surpasses itself to take on the tragic force of myth.	https://books.google.com/books/content?id=SYu-4-oO3h8C&printsec=frontcover&img=1&zoom=1&source=gbs_api
97	Ulysses	9780141182803	Penguin UK	2000		en	Written over a seven-year period, from 1914 to 1921, this book has survived bowdlerization, legal action and controversy. The novel deals with the events of one day in Dublin, 16th June 1904, now known as "Bloomsday". The principal characters are Stephen Dedalus, Leopold Bloom and his wife Molly. Ulysses has been labelled dirty, blasphemous and unreadable. In a famous 1933 court decision, Judge John M. Woolsey declared it an emetic book--although he found it not quite obscene enough to disallow its importation into the United States--and Virginia Woolf was moved to decry James Joyce's "cloacal obsession". None of these descriptions, however, do the slightest justice to the novel. To this day it remains the modernist masterpiece, in which the author takes both Celtic lyricism and vulgarity to splendid extremes. It is funny, sorrowful, and even (in its own way) suspenseful. And despite the exegetical industry that has sprung up in the last 75 years, Ulysses is also a compulsively readable book.	https://books.google.com/books/content?id=HD3cW0XWvz0C&printsec=frontcover&img=1&zoom=1&source=gbs_api
113	The Twelve Caesars	9780140449211	Penguin	2002		en	As private secretary to the Emperor Hadrian, Suetonius gained access to the imperial archives and used them (along with carefully gathered eye-witness accounts) to produce one of the most colourful biographical works in history. 'The Twelve Caesars' chronicles the public careers and private lives of the men who wielded absolute power over Rome, from the foundation of the empire under Julius Caesar and Augustus, to the decline into depravity and civil war under Nero, and the recovery and stability that came with his successors. A masterpiece of anecdote, wry observation and detailed physical description, 'The Twelve Caesars' presents us with a gallery of vividly drawn - and all too human - individuals.	https://books.google.com/books/content?id=GhCHtcyf9AcC&printsec=frontcover&img=1&zoom=1&source=gbs_api
98	A Tale of Two Cities	9780141439600	Penguin	2003		en	'It was the best of times, it was the worst of times...' Charles Dickens's A Tale of Two Cities portrays a world on fire, split between Paris and London during the brutal and bloody events of the French Revolution. After eighteen years as a political prisoner in the Bastille the aging Dr Manette is finally released and reunited with his daughter in England. There, two very different men, Charles Darnay, an exiled French aristocrat, and Sydney Carton, a disreputable but brilliant English lawyer, become enmeshed through their love for Lucie Manette. From the tranquil lanes of London, they are all drawn against their will to the vengeful, bloodstained streets of Paris at the height of the Reign of Terror and soon fall under the lethal shadow of La Guillotine. This edition uses the text as it appeared in its first serial publication in 1859 to convey the full scope of Dickens's vision, and includes the original illustrations by H.K. Browne ('Phiz'). Richard Maxwell's introduction discusses the intricate interweaving of epic drama with personal tragedy. For more than seventy years, Penguin has been the leading publisher of classic literature in the English-speaking world. With more than 1,700 titles, Penguin Classics represents a global bookshelf of the best works throughout history and across genres and disciplines. Readers trust the series to provide authoritative texts enhanced by introductions and notes by distinguished scholars and contemporary authors, as well as up-to-date translations by award-winning translators.	https://books.google.com/books/content?id=FcOsBmJCJXsC&printsec=frontcover&img=1&zoom=1&source=gbs_api
99	Don Quixote	9780142437230	National Geographic Books	2003		en	Nominated as one of America’s best-loved novels by PBS’s The Great American Read Don Quixote has become so entranced reading tales of chivalry that he decides to turn knight errant himself. In the company of his faithful squire, Sancho Panza, these exploits blossom in all sorts of wonderful ways. While Quixote's fancy often leads him astray—he tilts at windmills, imagining them to be giants—Sancho acquires cunning and a certain sagacity. Sane madman and wise fool, they roam the world together-and together they have haunted readers' imaginations for nearly four hundred years. With its experimental form and literary playfulness, Don Quixote has been generally recognized as the first modern novel. This Penguin Classics edition, with its beautiful new cover design, includes John Rutherford's masterly translation, which does full justice to the energy and wit of Cervantes's prose, as well as a brilliant critical introduction by Roberto Gonzalez Echevarriá.	https://books.google.com/books/content?id=ipyMEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
100	Bleak House	9780141439723	National Geographic Books	2003		en	Charles Dickens's masterful assault on the injustices of the British legal system As the interminable case of 'Jarndyce and Jarndyce' grinds its way through the Court of Chancery, it draws together a disparate group of people: Ada and Richard Clare, whose inheritance is gradually being devoured by legal costs; Esther Summerson, a ward of court, whose parentage is a source of deepening mystery; the menacing lawyer Tulkinghorn; the determined sleuth Inspector Bucket; and even Jo, the destitute little crossing-sweeper. A savage, but often comic, indictment of a society that is rotten to the core, Bleak House is one of Dickens's most ambitious novels, with a range that extends from the drawing rooms of the aristocracy to the poorest of London slums. This edition follows the first book edition of 1853, and includes all the original illustrations by 'Phiz', as well as appendices on the Chancery and spontaneous combustion. In his preface, Terry Eagleton examines characterisation and considers Bleak House as an early work of detective fiction. For more than seventy years, Penguin has been the leading publisher of classic literature in the English-speaking world. With more than 1,700 titles, Penguin Classics represents a global bookshelf of the best works throughout history and across genres and disciplines. Readers trust the series to provide authoritative texts enhanced by introductions and notes by distinguished scholars and contemporary authors, as well as up-to-date translations by award-winning translators.	https://books.google.com/books/content?id=246MEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
101	Jane Eyre	9780142437209	Penguin	2003		en	Retells the classic story of an orphaned young woman who accepts employment as a governess and soon finds herself in love with her employer.	https://books.google.com/books/content?id=wRYXFHqwW98C&printsec=frontcover&img=1&zoom=1&source=gbs_api
102	The Count of Monte Cristo	9780140449266	Penguin UK	2003		en	Translated with an Introduction by Robin Buss	https://books.google.com/books/content?id=kLZg3grRVZsC&printsec=frontcover&img=1&zoom=1&source=gbs_api
103	The Crucible	9780142437339	Penguin	2003		en	A haunting examination of groupthink and mass hysteria in a rural community A Penguin Classic "I believe that the reader will discover here the essential nature of one of the strangest and most awful chapters in human history," Arthur Miller wrote in an introduction to The Crucible, his classic play about the witch-hunts and trials in seventeenth-century Salem, Massachusetts. Based on historical people and real events, Miller's drama is a searing portrait of a community engulfed by hysteria. In the rigid theocracy of Salem, rumors that women are practicing witchcraft galvanize the town's most basic fears and suspicions; and when a young girl accuses Elizabeth Proctor of being a witch, self-righteous church leaders and townspeople insist that Elizabeth be brought to trial. The ruthlessness of the prosecutors and the eagerness of neighbor to testify against neighbor brilliantly illuminate the destructive power of socially sanctioned violence. Written in 1953, The Crucible is a mirror Miller uses to reflect the anti-communist hysteria inspired by Senator Joseph McCarthy's "witch-hunts" in the United States. Within the text itself, Miller contemplates the parallels, writing: "Political opposition...is given an inhumane overlay, which then justifies the abrogation of all normally applied customs of civilized behavior. A political policy is equated with moral right, and opposition to it with diabolical malevolence." For more than seventy years, Penguin has been the leading publisher of classic literature in the English-speaking world. With more than 1,700 titles, Penguin Classics represents a global bookshelf of the best works throughout history and across genres and disciplines. Readers trust the series to provide authoritative texts enhanced by introductions and notes by distinguished scholars and contemporary authors, as well as up-to-date translations by award-winning translators.	https://books.google.com/books/content?id=vq-KDQAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
104	The Epic of Gilgamesh	9780140449198	Penguin	2003		en	Andrew George's "masterly new translation" (The Times) of the world's first truly great work of literature A Penguin Classic Miraculously preserved on clay tablets dating back as much as four thousand years, the poem of Gilgamesh, king of Uruk, is the world’s oldest epic, predating Homer by many centuries. The story tells of Gilgamesh’s adventures with the wild man Enkidu, and of his arduous journey to the ends of the earth in quest of the Babylonian Noah and the secret of immortality. Alongside its themes of family, friendship and the duties of kings, the Epic of Gilgamesh is, above all, about mankind’s eternal struggle with the fear of death. The Babylonian version has been known for over a century, but linguists are still deciphering new fragments in Akkadian and Sumerian. Andrew George’s gripping translation brilliantly combines these into a fluent narrative and will long rank as the definitive English Gilgamesh. For more than seventy years, Penguin has been the leading publisher of classic literature in the English-speaking world. With more than 1,700 titles, Penguin Classics represents a global bookshelf of the best works throughout history and across genres and disciplines. Readers trust the series to provide authoritative texts enhanced by introductions and notes by distinguished scholars and contemporary authors, as well as up-to-date translations by award-winning translators.	https://books.google.com/books/content?id=eCZRK_61adMC&printsec=frontcover&img=1&zoom=1&source=gbs_api
105	The Bhagavad Gita	9780140449181	Penguin	2003		en	The eighteen chapters of The Bhagavad Gita (c. 500 b.c.), the glory of Sanskrit literature, encompass the whole spiritual struggle of a human soul. Its three central themes—love, light, and life—arise from the symphonic vision of God in all things and of all things in God. For more than seventy years, Penguin has been the leading publisher of classic literature in the English-speaking world. With more than 1,700 titles, Penguin Classics represents a global bookshelf of the best works throughout history and across genres and disciplines. Readers trust the series to provide authoritative texts enhanced by introductions and notes by distinguished scholars and contemporary authors, as well as up-to-date translations by award-winning translators.	https://books.google.com/books/content?id=UZEKghCNbVIC&printsec=frontcover&img=1&zoom=1&source=gbs_api
106	The Symposium	9780140449273	Penguin	2003		en	A fascinating discussion on sex, gender, and human instincts, as relevant today as ever In the course of a lively drinking party, a group of Athenian intellectuals exchange views on eros, or desire. From their conversation emerges a series of subtle reflections on gender roles, sex in society and the sublimation of basic human instincts. The discussion culminates in a radical challenge to conventional views by Plato's mentor, Socrates, who advocates transcendence through spiritual love. The Symposium is a deft interweaving of different viewpoints and ideas about the nature of love—as a response to beauty, a cosmic force, a motive for social action and as a means of ethical education. For more than seventy years, Penguin has been the leading publisher of classic literature in the English-speaking world. With more than 1,700 titles, Penguin Classics represents a global bookshelf of the best works throughout history and across genres and disciplines. Readers trust the series to provide authoritative texts enhanced by introductions and notes by distinguished scholars and contemporary authors, as well as up-to-date translations by award-winning translators.	https://books.google.com/books/content?id=6ohPEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
107	The Decameron	9780140449303	Penguin UK	2003		en	Translated with an Introduction and Notes by G. H. McWilliam	https://books.google.com/books/content?id=ZfTKmHnQaiwC&printsec=frontcover&img=1&zoom=1&source=gbs_api
108	Meditations	9780140449334	National Geographic Books	2006		en	A leading translation of Stoic philosophy in wise and practical aphorisms that have inspired Bill Clinton, Ryan Holiday, Anna Kendrick and many more. Written in Greek by an intellectual Roman emperor without any intention of publication, the Meditations of Marcus Aurelius offer a wide range of fascinating spiritual reflections and exercises developed as the leader struggled to understand himself and make sense of the universe. Spanning from doubt and despair to conviction and exaltation, they cover such diverse topics as the question of virtue, human rationality, the nature of the gods and the values of leadership. But while the Meditations were composed to provide personal consolation, in developing his beliefs Marcus also created one of the greatest of all works of philosophy: a series of wise and practical aphorisms that have been consulted and admired by statesmen, thinkers and ordinary readers for almost two thousand years. To provide a full understanding of Aurelius's seminal work, this edition includes explanatory notes, a general index, an index of quotations, an index of names, and an introduction by Diskin Clay putting the work in its biographical, historical, and literary context, a chronology of Marcus Aurelius's life and career. For more than seventy years, Penguin has been the leading publisher of classic literature in the English-speaking world. With more than 1,700 titles, Penguin Classics represents a global bookshelf of the best works throughout history and across genres and disciplines. Readers trust the series to provide authoritative texts enhanced by introductions and notes by distinguished scholars and contemporary authors, as well as up-to-date translations by award-winning translators.	https://books.google.com/books/content?id=94OMEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
109	Oliver Twist	9780141439747	Penguin	2003		en	A gripping portrayal of London's dark criminal underbelly, this classic novel is scathing in its indictment of a cruel society and pervaded by an unforgettable sense of threat and mystery. The story of Oliver Twist—orphaned, and set upon by evil and adversity from his first breath—shocked readers when it was published. After running away from the workhouse and pompous beadle Mr Bumble, Oliver finds himself lured into a den of thieves peopled by vivid and memorable characters—the Artful Dodger, vicious burglar Bill Sikes, his dog Bull's Eye, and prostitute Nancy, all watched over by cunning master-thief Fagin. With Oliver Twist, Charles Dickens created an entirely new kind of fiction, scathing in its indictment of a cruel society, and pervaded by an unforgettable sense of threat and mystery. This Penguin Classics edition is the first critical edition to faithfully reproduce the text as its earliest readers would have encountered it from its serialization in Bentley's Miscellany. It includes an introduction by Philip Horne, a glossary of Victorian thieves' slang, a chronology of Dickens's life, a map of contemporary London and all of George Cruikshank's original illustrations. Penguin Classics is the leading publisher of classic literature in the English-speaking world, representing a global bookshelf of the best works throughout history and across genres and disciplines. Readers trust the series to provide authoritative texts enhanced by introductions and notes by distinguished scholars and contemporary authors, as well as up-to-date translations by award-winning translators.	https://books.google.com/books/content?id=sInhvU77pm4C&printsec=frontcover&img=1&zoom=1&source=gbs_api
110	The Koran	9780140449204	Penguin UK	2003		en	The holy scriptures of Islam present a record of the prophet Muhammad's oral teaching delivered in the seventh century.	https://books.google.com/books/content?id=J5KlCuKPgZsC&printsec=frontcover&img=1&zoom=1&source=gbs_api
111	The Brothers Karamazov	9780140449242	National Geographic Books	2003		en	Fyodor Dostoyevsky's powerful meditation on faith, meaning and morality, The Brothers Karamazov is translated with an introduction and notes by David McDuff in Penguin Classics. When brutal landowner Fyodor Karamazov is murdered, the lives of his sons are changed irrevocably: Mitya, the sensualist, whose bitter rivalry with his father immediately places him under suspicion for parricide; Ivan, the intellectual, whose mental tortures drive him to breakdown; the spiritual Alyosha, who tries to heal the family's rifts; and the shadowy figure of their bastard half-brother Smerdyakov. As the ensuing investigation and trial reveal the true identity of the murderer, Dostoyevsky's dark masterpiece evokes a world where the lines between innocence and corruption, good and evil, blur and everyone's faith in humanity is tested. This powerful translation of The Brothers Karamazov features and introduction highlighting Dostoyevsky's recurrent themes of guilt and salvation, with a new chronology and further reading. Fyodor Mikhailovich Dostoyevsky (1821-1881) was born in Moscow. From 1849-54 he lived in a convict prison, and in later years his passion for gambling led him deeply into debt. His other works available in Penguin Classics include Crime & Punishment, The Idiot and Demons. If you enjoyed The Brothers Karamazov you might like Nikolai Gogol's Dead Souls, also available in Penguin Classics. 'There is no writer who better demonstrates the contradictions and fluctuations of the creative mind than Dostoyevsky, and nowhere more astonishingly than in The Brothers Karamazov' Joyce Carol Oates 'Dostoyevsky was the only psychologist from whom I had anything to learn: he belongs to the happiest windfalls of my life' Friedrich Nietzsche 'The most magnificent novel ever written' Sigmund Freud	https://books.google.com/books/content?id=64OMEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
112	Medea and Other Plays	9780140449297	National Geographic Books	2003		en	Four plays by the Greek dramatist who started to interpret human behavior without reference to the wisdom of gods.	https://books.google.com/books/content?id=8YOMEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
114	Persuasion	9780141439686	Penguin	2003		en	Jane Austen's beloved and subtly subversive final novel of romantic tension and second chances. Now a motion picture from Netflix starring Dakota Johnson and Henry Golding, and a TikTok Book Club Pick. At twenty-­seven, Anne Elliot is no longer young and has few romantic prospects. Eight years earlier, she had been persuaded by her friend Lady Russell to break off her engagement to Frederick Wentworth, a handsome naval captain with neither fortune nor rank. What happens when they encounter each other again is movingly told in Jane Austen's last completed novel. Set in the fashionable societies of Lyme Regis and Bath, Persuasion is a brilliant satire of vanity and pretension, but, above all, it is a love story tinged with the heartache of missed opportunities. For more than seventy years, Penguin has been the leading publisher of classic literature in the English-speaking world. With more than 1,700 titles, Penguin Classics represents a global bookshelf of the best works throughout history and across genres and disciplines. Readers trust the series to provide authoritative texts enhanced by introductions and notes by distinguished scholars and contemporary authors, as well as up-to-date translations by award-winning translators.	https://books.google.com/books/content?id=9IQqEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
115	Harry Potter and the Deathly Hallows	9780545010221		2007		en	"The final adventure in J.K. Rowling's phenomenal, best-selling Harry Potter book series"--Provided by publisher.	https://books.google.com/books/content?id=JHEkAQAAMAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
116	Principles	9781501124020	Simon and Schuster	2017		en	Dalio "shares the unconventional principles that he's developed, refined, and used over the past forty years to create unique results in both life and business--and which any person or organization can adopt to help achieve their goals"--Amazon.com.	https://books.google.com/books/content?id=okk1DwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api
117	The Vanishing Half	9780525536291	Penguin	2020		en	#1 NEW YORK TIMES BESTSELLER ONE OF BARACK OBAMA'S FAVORITE BOOKS OF THE YEAR NAMED A BEST BOOK OF 2020 BY THE NEW YORK TIMES • THE WASHINGTON POST • NPR • PEOPLE • TIME MAGAZINE • VANITY FAIR • GLAMOUR New York Times Readers Pick: 100 Best Books of the 21st Century 2021 WOMEN'S PRIZE FINALIST “Bennett’s tone and style recalls James Baldwin and Jacqueline Woodson, but it’s especially reminiscent of Toni Morrison’s 1970 debut novel, The Bluest Eye.” —Kiley Reid, Wall Street Journal “A story of absolute, universal timelessness . . . For any era, it's an accomplished, affecting novel. For this moment, it’s piercing, subtly wending its way toward questions about who we are and who we want to be….” – Entertainment Weekly From The New York Times-bestselling author of The Mothers, a stunning new novel about twin sisters, inseparable as children, who ultimately choose to live in two very different worlds, one black and one white. The Vignes twin sisters will always be identical. But after growing up together in a small, southern black community and running away at age sixteen, it's not just the shape of their daily lives that is different as adults, it's everything: their families, their communities, their racial identities. Many years later, one sister lives with her black daughter in the same southern town she once tried to escape. The other secretly passes for white, and her white husband knows nothing of her past. Still, even separated by so many miles and just as many lies, the fates of the twins remain intertwined. What will happen to the next generation, when their own daughters' storylines intersect? Weaving together multiple strands and generations of this family, from the Deep South to California, from the 1950s to the 1990s, Brit Bennett produces a story that is at once a riveting, emotional family story and a brilliant exploration of the American history of passing. Looking well beyond issues of race, The Vanishing Half considers the lasting influence of the past as it shapes a person's decisions, desires, and expectations, and explores some of the multiple reasons and realms in which people sometimes feel pulled to live as something other than their origins. As with her New York Times-bestselling debut The Mothers, Brit Bennett offers an engrossing page-turner about family and relationships that is immersive and provocative, compassionate and wise.	https://books.google.com/books/content?id=-vnoDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
118	Between the World and Me	9780812993547	National Geographic Books	2015		en	#1 NEW YORK TIMES BESTSELLER • NATIONAL BOOK AWARD WINNER • NAMED ONE OF TIME’S TEN BEST NONFICTION BOOKS OF THE DECADE • PULITZER PRIZE FINALIST • NATIONAL BOOK CRITICS CIRCLE AWARD FINALIST • ONE OF OPRAH’S “BOOKS THAT HELP ME THROUGH” • NOW AN HBO ORIGINAL SPECIAL EVENT Hailed by Toni Morrison as “required reading,” a bold and personal literary exploration of America’s racial history by “the most important essayist in a generation and a writer who changed the national political conversation about race” (Rolling Stone) NAMED ONE OF THE MOST INFLUENTIAL BOOKS OF THE DECADE BY CNN • NAMED ONE OF PASTE’S BEST MEMOIRS OF THE DECADE • NAMED ONE OF THE TEN BEST BOOKS OF THE YEAR BY The New York Times Book Review • O: The Oprah Magazine • The Washington Post • People • Entertainment Weekly • Vogue • Los Angeles Times • San Francisco Chronicle • Chicago Tribune • New York • Newsday • Library Journal • Publishers Weekly In a profound work that pivots from the biggest questions about American history and ideals to the most intimate concerns of a father for his son, Ta-Nehisi Coates offers a powerful new framework for understanding our nation’s history and current crisis. Americans have built an empire on the idea of “race,” a falsehood that damages us all but falls most heavily on the bodies of black women and men—bodies exploited through slavery and segregation, and, today, threatened, locked up, and murdered out of all proportion. What is it like to inhabit a black body and find a way to live within it? And how can we all honestly reckon with this fraught history and free ourselves from its burden? Between the World and Me is Ta-Nehisi Coates’s attempt to answer these questions in a letter to his adolescent son. Coates shares with his son—and readers—the story of his awakening to the truth about his place in the world through a series of revelatory experiences, from Howard University to Civil War battlefields, from the South Side of Chicago to Paris, from his childhood home to the living rooms of mothers whose children’s lives were taken as American plunder. Beautifully woven from personal narrative, reimagined history, and fresh, emotionally charged reportage, Between the World and Me clearly illuminates the past, bracingly confronts our present, and offers a transcendent vision for a way forward.	https://books.google.com/books/content?id=DiyPEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
119	All the Light We Cannot See	9781501173219	Simon and Schuster	2017		en	A cloth bag containing 20 paperback copies of the title that may also include a folder with sign out sheets.	https://books.google.com/books/content?id=giaLDgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api
120	The 4-hour Workweek	9780307465351	Crown	2009		en	An edition expanded with more than 100 pages of new content offers a blueprint for a better life, whether one's dream is escaping the rat race, experiencing high-end world travel, earning a monthly five-figure income with zero management or just living more and working less.	https://books.google.com/books/content?id=7ayVcWQJ89YC&printsec=frontcover&img=1&zoom=1&source=gbs_api
121	Sapiens	9780062316110	Harper Perennial	2018		en	Official U.S. edition with full color illustrations throughout. #1 New York Times Bestseller The Summer Reading Pick for President Barack Obama, Bill Gates, and Mark Zuckerberg, now available as a beautifully packaged paperback From a renowned historian comes a groundbreaking narrative of humanity’s creation and evolution—a #1 international bestseller—that explores the ways in which biology and history have defined us and enhanced our understanding of what it means to be “human.” One hundred thousand years ago, at least six different species of humans inhabited Earth. Yet today there is only one—homo sapiens. What happened to the others? And what may happen to us? Most books about the history of humanity pursue either a historical or a biological approach, but Dr. Yuval Noah Harari breaks the mold with this highly original book that begins about 70,000 years ago with the appearance of modern cognition. From examining the role evolving humans have played in the global ecosystem to charting the rise of empires, Sapiens integrates history and science to reconsider accepted narratives, connect past developments with contemporary concerns, and examine specific events within the context of larger ideas. Dr. Harari also compels us to look ahead, because over the last few decades humans have begun to bend laws of natural selection that have governed life for the past four billion years. We are acquiring the ability to design not only the world around us, but also ourselves. Where is this leading us, and what do we want to become? Featuring 27 photographs, 6 maps, and 25 illustrations/diagrams, this provocative and insightful work is sure to spark debate and is essential reading for aficionados of Jared Diamond, James Gleick, Matt Ridley, Robert Wright, and Sharon Moalem.	https://books.google.com/books/content?id=FILmrQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
122	Pachinko (National Book Award Finalist)	9781455563920	Grand Central Publishing	2017		en	NATIONAL BOOK AWARD FINALIST * A NEW YORK TIMES BOOK REVIEW TOP TEN OF THE YEAR * NEW YORK TIMES NOTABLE BOOK OF 2017 *A USA TODAY TOP TEN OF 2017 Roxane Gay's Favorite Book of 2017, Washington Post NEW YORK TIMES BESTSELLER * #1 BOSTON GLOBE BESTSELLER * USA TODAY BESTSELLER In this gorgeous, page-turning saga, four generations of a poor Korean immigrant family fight to control their destiny in 20th-century Japan, exiled from a home they never knew. "There could only be a few winners, and a lot of losers. And yet we played on, because we had hope that we might be the lucky ones." In the early 1900s, teenaged Sunja, the adored daughter of a crippled fisherman, falls for a wealthy stranger at the seashore near her home in Korea. He promises her the world, but when she discovers she is pregnant--and that her lover is married--she refuses to be bought. Instead, she accepts an offer of marriage from a gentle, sickly minister passing through on his way to Japan. But her decision to abandon her home, and to reject her son's powerful father, sets off a dramatic saga that will echo down through the generations. Richly told and profoundly moving, Pachinko is a story of love, sacrifice, ambition, and loyalty. From bustling street markets to the halls of Japan's finest universities to the pachinko parlors of the criminal underworld, Lee's complex and passionate characters--strong, stubborn women, devoted sisters and sons, fathers shaken by moral crisis--survive and thrive against the indifferent arc of history. *Includes reading group guide*	https://books.google.com/books/content?id=AV6HtAEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
123	Good to Great	9780066620992	Harper Collins	2001		en	The Challenge Built to Last, the defining management study of the nineties, showed how great companies triumph over time and how long-term sustained performance can be engineered into the DNA of an enterprise from the verybeginning. But what about the company that is not born with great DNA? How can good companies, mediocre companies, even bad companies achieve enduring greatness? The Study For years, this question preyed on the mind of Jim Collins. Are there companies that defy gravity and convert long-term mediocrity or worse into long-term superiority? And if so, what are the universal distinguishing characteristics that cause a company to go from good to great? The Standards Using tough benchmarks, Collins and his research team identified a set of elite companies that made the leap to great results and sustained those results for at least fifteen years. How great? After the leap, the good-to-great companies generated cumulative stock returns that beat the general stock market by an average of seven times in fifteen years, better than twice the results delivered by a composite index of the world's greatest companies, including Coca-Cola, Intel, General Electric, and Merck. The Comparisons The research team contrasted the good-to-great companies with a carefully selected set of comparison companies that failed to make the leap from good to great. What was different? Why did one set of companies become truly great performers while the other set remained only good? Over five years, the team analyzed the histories of all twenty-eight companies in the study. After sifting through mountains of data and thousands of pages of interviews, Collins and his crew discovered the key determinants of greatness -- why some companies make the leap and others don't. The Findings The findings of the Good to Great study will surprise many readers and shed light on virtually every area of management strategy and practice. The findings include: Level 5 Leaders: The research team was shocked to discover the type of leadership required to achieve greatness. The Hedgehog Concept (Simplicity within the Three Circles): To go from good to great requires transcending the curse of competence. A Culture of Discipline: When you combine a culture of discipline with an ethic of entrepreneurship, you get the magical alchemy of great results. Technology Accelerators: Good-to-great companies think differently about the role of technology. The Flywheel and the Doom Loop: Those who launch radical change programs and wrenching restructurings will almost certainly fail to make the leap. “Some of the key concepts discerned in the study,” comments Jim Collins, "fly in the face of our modern business culture and will, quite frankly, upset some people.” Perhaps, but who can afford to ignore these findings?	https://books.google.com/books/content?id=pJNt2ZFFT3sC&printsec=frontcover&img=1&zoom=1&source=gbs_api
124	Into the Wild	9780385486804	Villard	2007		en	In April 1992, a young man from a well-to-do family hitchhikes to Alaska and walks alone into the wilderness north of Mt. McKinley. Four months later, his decomposed body is found by a moose hunter. How Chris McCandless came to die is the unforgettable story of Into the Wild.	https://books.google.com/books/content?id=Xk_YAAAAMAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
125	A Brief History of Time	9780553380163	Bantam	1998		en	#1 NEW YORK TIMES BESTSELLER A landmark volume in science writing by one of the great minds of our time, Stephen Hawking’s book explores such profound questions as: How did the universe begin—and what made its start possible? Does time always flow forward? Is the universe unending—or are there boundaries? Are there other dimensions in space? What will happen when it all ends? Told in language we all can understand, A Brief History of Time plunges into the exotic realms of black holes and quarks, of antimatter and “arrows of time,” of the big bang and a bigger God—where the possibilities are wondrous and unexpected. With exciting images and profound imagination, Stephen Hawking brings us closer to the ultimate secrets at the very heart of creation.	https://books.google.com/books/content?id=YmGxbPHFO_EC&printsec=frontcover&img=1&zoom=1&source=gbs_api
126	Fifty Shades Trilogy	9780345803481		2011		en	When Anastasia Steele, a young literature student, interviews wealthy young entrepreneur Christian Grey for her campus magazine, their initial meeting introduces Anastasia to an exciting new world that will change them both forever.	
127	The Effective Executive	9780060833459	Harper Collins	2006		en	What makes an effective executive? The measure of the executive, Peter F. Drucker reminds us, is the ability to "get the right things done." This usually involves doing what other people have overlooked as well as avoiding what is unproductive. Intelligence, imagination, and knowledge may all be wasted in an executive job without the acquired habits of mind that mold them into results. Drucker identifies five practices essential to business effectiveness that can, and must, be learned: Managing time Choosing what to contribute to the organization Knowing where and how to mobilize strength for best effect Setting the right priorities Knitting all of them together with effective decision-making Ranging widely through the annals of business and government, Peter F. Drucker demonstrates the distinctive skill of the executive and offers fresh insights into old and seemingly obvious business situations.	https://books.google.com/books/content?id=SaoTTY4i1GgC&printsec=frontcover&img=1&zoom=1&source=gbs_api
\.


--
-- Data for Name: book_author; Type: TABLE DATA; Schema: public; Owner: akhil
--

COPY public.book_author (book_id, author_id) FROM stdin;
39	54
40	55
41	56
43	58
44	59
45	60
46	61
48	63
49	64
50	65
51	66
52	67
53	68
54	69
55	70
55	71
56	72
57	73
58	74
59	75
59	76
60	77
60	78
60	79
60	80
61	81
61	82
61	83
61	84
62	85
63	86
64	87
65	88
66	88
67	89
68	90
69	91
70	92
71	93
72	94
73	90
74	95
75	95
76	62
77	96
78	97
79	97
80	62
81	98
81	62
81	99
82	55
83	55
84	100
85	101
86	102
87	103
88	104
89	105
90	106
91	107
92	108
93	109
94	110
95	111
95	112
95	113
96	114
97	115
98	116
99	117
100	116
101	118
102	119
103	120
106	121
107	122
108	123
109	116
111	114
112	124
113	125
114	59
115	55
116	126
117	127
118	128
119	129
120	130
121	63
122	131
123	132
124	133
125	134
126	135
127	136
\.


--
-- Data for Name: book_genre; Type: TABLE DATA; Schema: public; Owner: akhil
--

COPY public.book_genre (book_id, genre_id) FROM stdin;
39	30
40	31
41	30
43	30
44	30
45	31
46	30
48	33
49	34
50	34
51	34
52	35
53	35
54	35
55	35
56	34
57	34
58	36
59	36
60	36
61	34
62	36
63	34
64	36
65	30
66	30
67	31
68	30
69	30
70	30
71	30
72	37
73	30
74	30
75	30
76	30
77	30
78	30
79	30
80	38
81	39
81	40
82	41
83	42
84	30
85	30
86	43
87	44
88	34
89	37
90	45
91	30
92	30
93	46
94	33
95	33
96	30
97	30
98	30
99	30
100	30
101	30
102	30
103	47
104	48
105	49
106	44
107	30
108	44
109	30
110	49
111	30
112	47
113	30
114	30
115	31
116	34
117	30
118	43
119	30
120	34
121	33
122	30
123	34
124	43
125	33
126	50
127	34
\.


--
-- Data for Name: fine; Type: TABLE DATA; Schema: public; Owner: akhil
--

COPY public.fine (fine_id, issue_id, amount, paid_status, payment_date) FROM stdin;
3	28	10.00	paid	2026-03-11
4	36	50.00	waived	2026-03-13
\.


--
-- Data for Name: genre; Type: TABLE DATA; Schema: public; Owner: akhil
--

COPY public.genre (genre_id, genre_name) FROM stdin;
30	Fiction
31	Juvenile Fiction
32	London (England)
33	Science
34	Business & Economics
35	Self-Help
36	Computers
37	History
38	Adventure stories
39	Fantasy fiction
40	English
41	England
42	Bildungsromans
43	Biography & Autobiography
44	Philosophy
45	Medical
46	Mathematics
47	Drama
48	Poetry
49	Religion
50	Businessmen
\.


--
-- Data for Name: issue_record; Type: TABLE DATA; Schema: public; Owner: akhil
--

COPY public.issue_record (issue_id, user_id, copy_id, borrow_date, due_date, return_date, status, created_at, renewed) FROM stdin;
31	e1f80598-b00c-4790-ae39-0573cc5a9368	170	2026-03-11	2026-03-25	2026-03-11	returned	2026-03-11 11:53:33.394735	\N
28	eaedb4e6-77e2-4927-9d50-2dcbf34ad487	141	2026-03-10	2026-03-10	2026-03-11	returned	2026-03-10 17:00:54.273488	\N
32	eaedb4e6-77e2-4927-9d50-2dcbf34ad487	170	2026-03-11	2026-03-25	2026-03-11	returned	2026-03-11 14:07:54.598951	\N
33	eaedb4e6-77e2-4927-9d50-2dcbf34ad487	170	2026-02-28	2026-03-08	2026-03-11	returned	2026-03-11 15:04:38.344658	\N
34	eaedb4e6-77e2-4927-9d50-2dcbf34ad487	170	2026-03-11	2026-03-25	\N	active	2026-03-11 15:27:59.836053	\N
35	eaedb4e6-77e2-4927-9d50-2dcbf34ad487	136	2026-03-11	2026-03-25	2026-03-11	returned	2026-03-11 15:58:24.906636	\N
36	e1f80598-b00c-4790-ae39-0573cc5a9368	136	2026-02-28	2026-03-08	\N	active	2026-03-12 13:48:19.408535	\N
37	e1f80598-b00c-4790-ae39-0573cc5a9368	141	2026-03-12	2026-03-26	2026-03-12	returned	2026-03-12 16:06:27.33044	\N
38	eaedb4e6-77e2-4927-9d50-2dcbf34ad487	141	2026-03-12	2026-03-26	2026-03-12	returned	2026-03-12 16:06:57.490039	\N
39	248b588e-1eed-4e8a-9363-481c1e647aa0	141	2026-03-12	2026-03-26	2026-03-12	returned	2026-03-12 16:07:55.225841	\N
21	eaedb4e6-77e2-4927-9d50-2dcbf34ad487	141	2026-03-10	2026-03-24	2026-03-10	returned	2026-03-10 15:08:41.947163	\N
22	eaedb4e6-77e2-4927-9d50-2dcbf34ad487	141	2026-03-10	2026-03-24	2026-03-10	returned	2026-03-10 15:09:53.373632	\N
23	eaedb4e6-77e2-4927-9d50-2dcbf34ad487	141	2026-03-10	2026-03-24	2026-03-10	returned	2026-03-10 15:14:51.833611	\N
25	eaedb4e6-77e2-4927-9d50-2dcbf34ad487	136	2026-03-10	2026-03-24	2026-03-10	returned	2026-03-10 15:56:51.466191	\N
26	eaedb4e6-77e2-4927-9d50-2dcbf34ad487	136	2026-03-10	2026-03-24	2026-03-10	returned	2026-03-10 15:57:26.980289	\N
27	eaedb4e6-77e2-4927-9d50-2dcbf34ad487	136	2026-03-10	2026-03-24	2026-03-10	returned	2026-03-10 16:59:45.555743	\N
24	eaedb4e6-77e2-4927-9d50-2dcbf34ad487	141	2026-03-10	2026-03-24	2026-03-10	returned	2026-03-10 15:37:15.002889	\N
29	e1f80598-b00c-4790-ae39-0573cc5a9368	170	2026-03-11	2026-03-25	2026-03-11	returned	2026-03-11 11:03:26.95298	\N
30	001188ef-cb81-4a9f-b7fd-9e77d4c2c712	170	2026-03-11	2026-03-25	2026-03-11	returned	2026-03-11 11:52:32.804995	\N
\.


--
-- Data for Name: membership; Type: TABLE DATA; Schema: public; Owner: akhil
--

COPY public.membership (user_id, membership_type_id, start_date, end_date, status) FROM stdin;
\.


--
-- Data for Name: membership_type; Type: TABLE DATA; Schema: public; Owner: akhil
--

COPY public.membership_type (membership_type_id, type_name, borrow_limit, borrow_duration_days, fine_per_day, reservation_limit) FROM stdin;
\.


--
-- Data for Name: physical_copy; Type: TABLE DATA; Schema: public; Owner: akhil
--

COPY public.physical_copy (copy_id, book_id, status, shelf_location) FROM stdin;
137	39	available	\N
138	39	available	\N
139	39	available	\N
140	39	available	\N
142	40	available	\N
221	113	available	\N
222	114	available	\N
223	115	available	\N
224	116	available	\N
225	117	available	\N
226	118	available	\N
227	119	available	\N
228	120	available	\N
229	121	available	\N
230	122	available	\N
144	41	available	\N
147	43	available	\N
148	43	available	\N
231	123	available	\N
232	124	available	\N
233	125	available	\N
234	125	available	\N
235	126	available	\N
151	46	available	\N
153	48	available	\N
154	49	available	\N
155	50	available	\N
156	51	available	\N
157	52	available	\N
158	53	available	\N
159	54	available	\N
160	55	available	\N
161	56	available	\N
162	57	available	\N
163	58	available	\N
164	59	available	\N
165	60	available	\N
166	61	available	\N
167	62	available	\N
168	63	available	\N
169	64	available	\N
236	127	available	\N
136	39	issued	\N
141	40	available	\N
150	45	available	\N
143	41	available	\N
172	67	available	\N
173	67	available	\N
171	66	available	\N
170	65	issued	\N
149	44	available	\N
174	68	available	\N
175	68	available	\N
176	69	available	\N
177	69	available	\N
178	70	available	\N
179	71	available	\N
180	72	available	\N
181	73	available	\N
182	74	available	\N
183	75	available	\N
184	76	available	\N
185	77	available	\N
186	78	available	\N
187	79	available	\N
188	80	available	\N
189	81	available	\N
190	82	available	\N
191	83	available	\N
192	84	available	\N
193	85	available	\N
194	86	available	\N
195	87	available	\N
196	88	available	\N
197	89	available	\N
198	90	available	\N
199	91	available	\N
200	92	available	\N
201	93	available	\N
202	94	available	\N
203	95	available	\N
204	96	available	\N
205	97	available	\N
206	98	available	\N
207	99	available	\N
208	100	available	\N
209	101	available	\N
210	102	available	\N
211	103	available	\N
212	104	available	\N
213	105	available	\N
214	106	available	\N
215	107	available	\N
216	108	available	\N
217	109	available	\N
218	110	available	\N
219	111	available	\N
220	112	available	\N
\.


--
-- Data for Name: reservation; Type: TABLE DATA; Schema: public; Owner: akhil
--

COPY public.reservation (reservation_id, user_id, book_id, reservation_date, status, expires_at) FROM stdin;
21	e1f80598-b00c-4790-ae39-0573cc5a9368	65	2026-03-11 10:59:34.195526	fulfilled	2036-03-11 10:59:34.195529
20	001188ef-cb81-4a9f-b7fd-9e77d4c2c712	65	2026-03-11 10:56:01.921865	fulfilled	2026-03-12 11:44:40.68177
22	e1f80598-b00c-4790-ae39-0573cc5a9368	65	2026-03-11 11:50:42.771195	fulfilled	2026-03-12 11:52:37.388186
23	001188ef-cb81-4a9f-b7fd-9e77d4c2c712	45	2026-03-11 11:58:44.449399	cancelled	2026-03-12 11:58:44.449408
24	001188ef-cb81-4a9f-b7fd-9e77d4c2c712	41	2026-03-11 13:37:58.170395	cancelled	2026-03-12 13:37:58.170404
25	d622016c-8edc-4b3d-acbd-96a365312cf4	66	2026-03-11 15:10:31.066681	cancelled	2026-03-12 15:10:31.066694
19	eaedb4e6-77e2-4927-9d50-2dcbf34ad487	44	2026-03-11 10:30:03.047608	cancelled	2026-03-12 10:30:03.047639
\.


--
-- Data for Name: transaction_log; Type: TABLE DATA; Schema: public; Owner: akhil
--

COPY public.transaction_log (log_id, user_id, action_type, reference_type, reference_id, "timestamp", details) FROM stdin;
\.


--
-- Name: author_author_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akhil
--

SELECT pg_catalog.setval('public.author_author_id_seq', 136, true);


--
-- Name: book_book_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akhil
--

SELECT pg_catalog.setval('public.book_book_id_seq', 127, true);


--
-- Name: fine_fine_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akhil
--

SELECT pg_catalog.setval('public.fine_fine_id_seq', 4, true);


--
-- Name: genre_genre_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akhil
--

SELECT pg_catalog.setval('public.genre_genre_id_seq', 50, true);


--
-- Name: issue_record_issue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akhil
--

SELECT pg_catalog.setval('public.issue_record_issue_id_seq', 39, true);


--
-- Name: membership_type_membership_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akhil
--

SELECT pg_catalog.setval('public.membership_type_membership_type_id_seq', 1, false);


--
-- Name: physical_copy_copy_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akhil
--

SELECT pg_catalog.setval('public.physical_copy_copy_id_seq', 236, true);


--
-- Name: reservation_reservation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akhil
--

SELECT pg_catalog.setval('public.reservation_reservation_id_seq', 25, true);


--
-- Name: transaction_log_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: akhil
--

SELECT pg_catalog.setval('public.transaction_log_log_id_seq', 1, false);


--
-- Name: User User_email_key; Type: CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_email_key" UNIQUE (email);


--
-- Name: User User_membership_number_key; Type: CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_membership_number_key" UNIQUE (membership_number);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (user_id);


--
-- Name: author author_author_name_key; Type: CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.author
    ADD CONSTRAINT author_author_name_key UNIQUE (author_name);


--
-- Name: author author_pkey; Type: CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.author
    ADD CONSTRAINT author_pkey PRIMARY KEY (author_id);


--
-- Name: book_author book_author_pkey; Type: CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.book_author
    ADD CONSTRAINT book_author_pkey PRIMARY KEY (book_id, author_id);


--
-- Name: book_genre book_genre_pkey; Type: CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.book_genre
    ADD CONSTRAINT book_genre_pkey PRIMARY KEY (book_id, genre_id);


--
-- Name: book book_isbn_key; Type: CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.book
    ADD CONSTRAINT book_isbn_key UNIQUE (isbn);


--
-- Name: book book_pkey; Type: CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.book
    ADD CONSTRAINT book_pkey PRIMARY KEY (book_id);


--
-- Name: fine fine_issue_id_key; Type: CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.fine
    ADD CONSTRAINT fine_issue_id_key UNIQUE (issue_id);


--
-- Name: fine fine_pkey; Type: CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.fine
    ADD CONSTRAINT fine_pkey PRIMARY KEY (fine_id);


--
-- Name: genre genre_genre_name_key; Type: CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.genre
    ADD CONSTRAINT genre_genre_name_key UNIQUE (genre_name);


--
-- Name: genre genre_pkey; Type: CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.genre
    ADD CONSTRAINT genre_pkey PRIMARY KEY (genre_id);


--
-- Name: issue_record issue_record_pkey; Type: CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.issue_record
    ADD CONSTRAINT issue_record_pkey PRIMARY KEY (issue_id);


--
-- Name: membership membership_pkey; Type: CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.membership
    ADD CONSTRAINT membership_pkey PRIMARY KEY (user_id);


--
-- Name: membership_type membership_type_pkey; Type: CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.membership_type
    ADD CONSTRAINT membership_type_pkey PRIMARY KEY (membership_type_id);


--
-- Name: membership_type membership_type_type_name_key; Type: CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.membership_type
    ADD CONSTRAINT membership_type_type_name_key UNIQUE (type_name);


--
-- Name: physical_copy physical_copy_pkey; Type: CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.physical_copy
    ADD CONSTRAINT physical_copy_pkey PRIMARY KEY (copy_id);


--
-- Name: reservation reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_pkey PRIMARY KEY (reservation_id);


--
-- Name: transaction_log transaction_log_pkey; Type: CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.transaction_log
    ADD CONSTRAINT transaction_log_pkey PRIMARY KEY (log_id);


--
-- Name: User user_phone_unique; Type: CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT user_phone_unique UNIQUE (phone_number);


--
-- Name: book_author fk_ba_author; Type: FK CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.book_author
    ADD CONSTRAINT fk_ba_author FOREIGN KEY (author_id) REFERENCES public.author(author_id) ON DELETE CASCADE;


--
-- Name: book_author fk_ba_book; Type: FK CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.book_author
    ADD CONSTRAINT fk_ba_book FOREIGN KEY (book_id) REFERENCES public.book(book_id) ON DELETE CASCADE;


--
-- Name: book_genre fk_bg_book; Type: FK CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.book_genre
    ADD CONSTRAINT fk_bg_book FOREIGN KEY (book_id) REFERENCES public.book(book_id) ON DELETE CASCADE;


--
-- Name: book_genre fk_bg_genre; Type: FK CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.book_genre
    ADD CONSTRAINT fk_bg_genre FOREIGN KEY (genre_id) REFERENCES public.genre(genre_id) ON DELETE CASCADE;


--
-- Name: physical_copy fk_copy_book; Type: FK CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.physical_copy
    ADD CONSTRAINT fk_copy_book FOREIGN KEY (book_id) REFERENCES public.book(book_id) ON DELETE CASCADE;


--
-- Name: fine fk_fine_issue; Type: FK CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.fine
    ADD CONSTRAINT fk_fine_issue FOREIGN KEY (issue_id) REFERENCES public.issue_record(issue_id) ON DELETE CASCADE;


--
-- Name: issue_record fk_issue_copy; Type: FK CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.issue_record
    ADD CONSTRAINT fk_issue_copy FOREIGN KEY (copy_id) REFERENCES public.physical_copy(copy_id);


--
-- Name: issue_record fk_issue_user; Type: FK CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.issue_record
    ADD CONSTRAINT fk_issue_user FOREIGN KEY (user_id) REFERENCES public."User"(user_id);


--
-- Name: transaction_log fk_log_user; Type: FK CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.transaction_log
    ADD CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES public."User"(user_id) ON DELETE SET NULL;


--
-- Name: membership fk_membership_type; Type: FK CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.membership
    ADD CONSTRAINT fk_membership_type FOREIGN KEY (membership_type_id) REFERENCES public.membership_type(membership_type_id);


--
-- Name: membership fk_membership_user; Type: FK CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.membership
    ADD CONSTRAINT fk_membership_user FOREIGN KEY (user_id) REFERENCES public."User"(user_id) ON DELETE CASCADE;


--
-- Name: reservation fk_res_book; Type: FK CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT fk_res_book FOREIGN KEY (book_id) REFERENCES public.book(book_id) ON DELETE CASCADE;


--
-- Name: reservation fk_res_user; Type: FK CONSTRAINT; Schema: public; Owner: akhil
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT fk_res_user FOREIGN KEY (user_id) REFERENCES public."User"(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict YJzxr3qHKBu3hjRmntsQE9KQ5YNJBzxdBjsTWMycECRVVBZoBrfFgyhuIJPFFdf

