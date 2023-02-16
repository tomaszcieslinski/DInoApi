--
-- PostgreSQL database dump
--

-- Dumped from database version 15.2
-- Dumped by pg_dump version 15.2

-- Started on 2023-02-16 19:16:01

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
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 3332 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 16447)
-- Name: wallets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallets (
    walletaddress character varying(50) NOT NULL
);


ALTER TABLE public.wallets OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 16454)
-- Name: wallettransactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallettransactions (
    walletaddress text,
    transactionhash text NOT NULL,
    "timestamp" timestamp(6) without time zone,
    value numeric,
    ethervalue numeric
);


ALTER TABLE public.wallettransactions OWNER TO postgres;

--
-- TOC entry 3325 (class 0 OID 16447)
-- Dependencies: 215
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: postgres
--


--
-- TOC entry 3178 (class 2606 OID 16467)
-- Name: wallets pk_wallets; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT pk_wallets PRIMARY KEY (walletaddress);


--
-- TOC entry 3180 (class 2606 OID 16460)
-- Name: wallettransactions pk_wallettransactions; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallettransactions
    ADD CONSTRAINT pk_wallettransactions PRIMARY KEY (transactionhash);


--
-- TOC entry 3181 (class 2606 OID 16477)
-- Name: wallets fk_wallets_wallets; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT fk_wallets_wallets FOREIGN KEY (walletaddress) REFERENCES public.wallets(walletaddress);


--
-- TOC entry 3182 (class 2606 OID 16468)
-- Name: wallettransactions fk_wallettransactions_wallets; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallettransactions
    ADD CONSTRAINT fk_wallettransactions_wallets FOREIGN KEY (walletaddress) REFERENCES public.wallets(walletaddress);


-- Completed on 2023-02-16 19:16:01

--
-- PostgreSQL database dump complete
--

