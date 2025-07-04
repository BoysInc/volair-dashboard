CREATE TABLE "users"(
    "id" UUID NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "email_verified_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255) NOT NULL,
    "role" BIGINT NOT NULL
);
ALTER TABLE
    "users" ADD PRIMARY KEY("id");
CREATE TABLE "aircrafts"(
    "id" UUID NOT NULL,
    "operator_id" VARCHAR(255) NOT NULL,
    "model_name" VARCHAR(255) NOT NULL,
    "manufacturer" VARCHAR(255) NOT NULL,
    "registration_number" VARCHAR(255) NOT NULL,
    "seating_capacity" BIGINT NOT NULL,
    "range_km" FLOAT(53) NOT NULL,
    "speed_kph" FLOAT(53) NOT NULL,
    "wifi_available" BOOLEAN NOT NULL,
    "image_url" VARCHAR(255) NOT NULL,
    "status" BIGINT NOT NULL
);
ALTER TABLE
    "aircrafts" ADD PRIMARY KEY("id");
ALTER TABLE
    "aircrafts" ADD CONSTRAINT "aircrafts_registration_number_unique" UNIQUE("registration_number");
CREATE TABLE "operators"(
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255) NOT NULL,
    "country" VARCHAR(255) NOT NULL,
    "license_number" VARCHAR(255) NOT NULL,
    "verified" BOOLEAN NOT NULL
);
ALTER TABLE
    "operators" ADD PRIMARY KEY("id");
ALTER TABLE
    "operators" ADD CONSTRAINT "operators_email_unique" UNIQUE("email");
CREATE TABLE "airports"(
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "iata_code" VARCHAR(255) NOT NULL,
    "city" VARCHAR(255) NOT NULL,
    "country" VARCHAR(255) NOT NULL,
    "latitude" FLOAT(53) NOT NULL,
    "longitude" FLOAT(53) NOT NULL,
    "timezone" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "airports" ADD PRIMARY KEY("id");
CREATE TABLE "flights"(
    "id" UUID NOT NULL,
    "aircraft_id" UUID NOT NULL,
    "departure_airport_id" UUID NOT NULL,
    "arrival_airport_id" UUID NOT NULL,
    "departure_time" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "arrival_time" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "estimated_duration" VARCHAR(255) NOT NULL,
    "status" BIGINT NOT NULL,
    "price_usd" BIGINT NOT NULL
);
ALTER TABLE
    "flights" ADD PRIMARY KEY("id");
CREATE TABLE "booking"(
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "flight_id" UUID NOT NULL,
    "passenger_count" BIGINT NOT NULL,
    "total_price" BIGINT NOT NULL,
    "status" BIGINT NOT NULL
);
ALTER TABLE
    "booking" ADD PRIMARY KEY("id");
CREATE TABLE "payments"(
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "amount" BIGINT NOT NULL,
    "currency" VARCHAR(255) NOT NULL,
    "payment_method" BIGINT NOT NULL,
    "payment_status" BIGINT NOT NULL,
    "transaction_reference" TEXT NOT NULL,
    "payment_date" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE
    "payments" ADD PRIMARY KEY("id");
CREATE TABLE "notifications"(
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" VARCHAR(255) NOT NULL,
    "read" BOOLEAN NOT NULL,
    "sent_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE
    "notifications" ADD PRIMARY KEY("id");
CREATE TABLE "review"(
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "aircraft_id" UUID NOT NULL,
    "rating" BIGINT NOT NULL,
    "comment" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "review" ADD PRIMARY KEY("id");
ALTER TABLE
    "flights" ADD CONSTRAINT "flights_arrival_airport_id_foreign" FOREIGN KEY("arrival_airport_id") REFERENCES "airports"("id");
ALTER TABLE
    "booking" ADD CONSTRAINT "booking_flight_id_foreign" FOREIGN KEY("flight_id") REFERENCES "flights"("id");
ALTER TABLE
    "payments" ADD CONSTRAINT "payments_booking_id_foreign" FOREIGN KEY("booking_id") REFERENCES "booking"("id");
ALTER TABLE
    "review" ADD CONSTRAINT "review_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "users"("id");
ALTER TABLE
    "notifications" ADD CONSTRAINT "notifications_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "users"("id");
ALTER TABLE
    "flights" ADD CONSTRAINT "flights_departure_airport_id_foreign" FOREIGN KEY("departure_airport_id") REFERENCES "airports"("id");
ALTER TABLE
    "booking" ADD CONSTRAINT "booking_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "users"("id");
ALTER TABLE
    "flights" ADD CONSTRAINT "flights_aircraft_id_foreign" FOREIGN KEY("aircraft_id") REFERENCES "aircrafts"("id");
ALTER TABLE
    "aircrafts" ADD CONSTRAINT "aircrafts_operator_id_foreign" FOREIGN KEY("operator_id") REFERENCES "operators"("id");