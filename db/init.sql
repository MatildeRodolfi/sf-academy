CREATE TABLE users(
    email text NOT NULL PRIMARY KEY,
    name text NOT NULL,
    iban text  NOT NULL,
    password text  NOT NULL,
    salt text NOT NULL,
    eur numeric(10,5) NOT NULL DEFAULT 0,
    usd numeric(10,5) NOT NULL DEFAULT 0
);

CREATE TABLE transactions(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    mail text NOT NULL,
    value numeric(10,5) NOT NULL,
    rate numeric(10,5) DEFAULT 1,
    "from" character(4) NOT NULL,
    "to" character(4) NOT NULL,
    date timestamp with time zone NOT NULL,
    CONSTRAINT transaction_pkey PRIMARY KEY (id),
    CONSTRAINT "transaction_users-mail_fkey" FOREIGN KEY (mail)
        REFERENCES users(email) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
);