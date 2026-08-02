-- ============================================================
-- I Rent U Rent — PostgreSQL schema + seed data
-- Generated from client-provided Excel property tracker
-- ============================================================

DROP TABLE IF EXISTS properties CASCADE;

CREATE TABLE properties (
    id                      SERIAL PRIMARY KEY,
    city                    VARCHAR(100),
    address_line1           VARCHAR(255) NOT NULL,
    state                   VARCHAR(2) NOT NULL DEFAULT 'PA',
    zip_code                VARCHAR(10),
    zillow_url              TEXT,
    property_type           VARCHAR(50),
    availability_date       VARCHAR(50),
    bedrooms                SMALLINT,
    bathrooms               NUMERIC(3,1),
    sqft                    INTEGER,
    lot_size                INTEGER,
    year_built              SMALLINT,
    status                  VARCHAR(30) NOT NULL DEFAULT 'Unverified'
                                CHECK (status IN ('Available','Listed for Rent','Listing Removed','Sold','Off Market','Unverified')),
    initial_monthly_rent    NUMERIC(10,2),
    current_monthly_rent    NUMERIC(10,2),
    sold_price              NUMERIC(12,2),
    source_row              INTEGER,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_bedrooms ON properties(bedrooms);

-- Convenience view: only currently available rentals, newest/available first
CREATE OR REPLACE VIEW available_properties AS
SELECT * FROM properties
WHERE status IN ('Available', 'Listed for Rent')
ORDER BY current_monthly_rent NULLS LAST, city;

-- ============================================================
-- Seed data (cleaned from IRURDATA.xlsx, 65 usable rows)
-- ============================================================

INSERT INTO properties
(city, address_line1, state, zip_code, zillow_url, property_type, availability_date,
 bedrooms, bathrooms, sqft, lot_size, year_built, status,
 initial_monthly_rent, current_monthly_rent, sold_price, source_row)
VALUES
('Pottstown', '56 Wil Be Dr', 'PA', '19465', 'https://www.zillow.com/homedetails/56-Wil-Be-Dr-Pottstown-PA-19465/306711683_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 4, 1837, 2207, 2020, 'Listing Removed', NULL, NULL, 406700.0, 2),
('Phoenixville', '927 Anvil Ct', 'PA', '19460', 'https://www.zillow.com/homedetails/927-Anvil-Ct-A-Phoenixville-PA-19460/2068815250_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 2, 1816, NULL, NULL, 'Listing Removed', NULL, NULL, 339200.0, 3),
('Phoenixville', '965 Skylar Ct', 'PA', '19460', 'https://www.zillow.com/homedetails/965-Skylar-Ct-LOT-118-Phoenixville-PA-19460/2067057609_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 2, 1816, NULL, NULL, 'Listing Removed', NULL, NULL, 388700.0, 4),
('Spring City', '703 Peony Lane', 'PA', '19465', 'https://www.zillow.com/homedetails/703-Peony-Ln-Spring-City-PA-19475/338946537_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 3, 1732, NULL, NULL, 'Listing Removed', NULL, NULL, 441700.0, 5),
('Spring City', '709 Peony Lane', 'PA', '19475', 'https://www.zillow.com/homedetails/709-Peony-Lane-Chas-LOT-136-Spring-City-PA-19475/2061230751_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 3, 1732, NULL, NULL, 'Listing Removed', NULL, NULL, 479100.0, 6),
('Spring City', '727 Peony Lane', 'PA', '19475', 'https://www.zillow.com/homedetails/727-Peony-Ln-Spring-City-PA-19475/2058077778_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 2, 2450, NULL, 2022, 'Available', NULL, 3200.0, NULL, 7),
('Spring City', '735 Peony Lane', 'PA', '19475', 'https://www.zillow.com/homedetails/735-Peony-Ln-Spring-City-PA-19475/2056030008_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 3, 2073, NULL, NULL, 'Listing Removed', NULL, NULL, 449900.0, 8),
('Spring City', '813 Pecan Rd', 'PA', '19475', 'https://www.zillow.com/homedetails/813-Pecan-Rd-Spring-City-PA-19475/2059088277_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 3, 1732, 2346, 2023, 'Sold', NULL, NULL, 435100.0, 9),
('Spring City', '815 Pecan Rd', 'PA', '19475', 'https://www.zillow.com/homedetails/815-Pecan-Rd-Spring-City-PA-19475/2059088205_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 3, 1732, NULL, NULL, 'Listing Removed', NULL, NULL, 435300.0, 10),
('Spring City', '902 Magnolia Lane', 'PA', '19475', 'https://www.zillow.com/homedetails/902-Magnolia-Ln-902-Spring-City-PA-19475/440360075_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 4, 2073, NULL, NULL, 'Available', 2999.0, 3999.0, NULL, 11),
('Spring City', '906 Magnolia Lane', 'PA', '19475', 'https://www.zillow.com/homedetails/906-Magnolia-Ln-Spring-City-PA-19475/2057166472_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 2, 2073, 2200, 2023, 'Listing Removed', NULL, NULL, 482900.0, 12),
('Pottstown', '7 Painters Way', 'PA', '19465', 'https://www.zillow.com/homedetails/7-Painters-Way-Pottstown-PA-19465/2055083488_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', '2026-08-01', 3, 2, NULL, NULL, 2024, 'Available', 3575.0, 3495.0, NULL, 13),
('Pottstown', '9 Painters Way', 'PA', '19465', 'https://www.zillow.com/homedetails/9-Painters-Way-Pottstown-PA-19465/443004558_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 3, NULL, NULL, NULL, 'Listing Removed', NULL, NULL, 549928.0, 14),
('Pottstown', '13 Painters Way', 'PA', '19465', 'https://www.zillow.com/homedetails/13-Painters-Way-Pottstown-PA-19465/455065385_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 2, 3524, 3640, 2025, 'Sold', NULL, NULL, 490000.0, 15),
('Pottstown', '15 Painters Way', 'PA', '19465', 'https://www.zillow.com/homedetails/15-Painters-Way-Pottstown-PA-19465/443840627_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 3, 3361, NULL, NULL, 'Sold', NULL, NULL, 492000.0, 16),
('Pottstown', '22 Painters Way', 'PA', '19465', 'https://www.zillow.com/homedetails/22-Painters-Way-Pottstown-PA-19465/442562390_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 3, 3361, NULL, NULL, 'Listing Removed', NULL, NULL, 495000.0, 17),
('Pottstown', '54 Painters Way', 'PA', '19465', 'https://www.zillow.com/homedetails/54-Painters-Way-Pottstown-PA-19465/452069472_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 3, 3364, NULL, NULL, 'Listing Removed', NULL, NULL, 545000.0, 18),
('Pottstown', '59 Painters Way', 'PA', '19465', 'https://www.zillow.com/homedetails/59-Painters-Way-Pottstown-PA-19465/455065581_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 2, 3524, 6565, 2024, 'Sold', NULL, NULL, 520000.0, 19),
('Pottstown', '61 Painters Way', 'PA', '19465', 'https://www.zillow.com/homedetails/61-Painters-Way-Pottstown-PA-19465/440239389_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 3, 3361, NULL, NULL, 'Listing Removed', NULL, NULL, 593200.0, 20),
('Pottstown', '63 Painters Way', 'PA', '19465', 'https://www.zillow.com/homedetails/63-Painters-Way-Pottstown-PA-19465/401939542_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 3, 3361, 3649, 2024, 'Sold', NULL, NULL, 520000.0, 21),
('Pottstown', '65 Painters Way', 'PA', '19465', 'https://www.zillow.com/homedetails/65-Painters-Way-Pottstown-PA-19465/359329367_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 3, 3361, 3640, NULL, 'Listing Removed', NULL, NULL, 490000.0, 22),
('Pottstown', '66 Painters Way', 'PA', '19465', 'https://www.zillow.com/homedetails/66-Painters-Way-Pottstown-PA-19465/347965723_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 3, 3361, NULL, NULL, 'Listing Removed', NULL, NULL, 538392.0, 23),
('Pottstown', '67 Painters Way', 'PA', '19465', 'https://www.zillow.com/homedetails/67-Painters-Way-Pottstown-PA-19465/439767237_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 3, 3361, 3640, 2024, 'Sold', NULL, NULL, 495000.0, 24),
('Pottstown', '77 Painters Way', 'PA', '19465', 'https://www.zillow.com/homedetails/77-Painters-Way-Pottstown-PA-19465/352049326_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 3, 3361, 3640, 2024, 'Listing Removed', NULL, NULL, 527500.0, 25),
('Pottstown', '79 Painters Way', 'PA', '19465', 'https://www.zillow.com/homedetails/79-Painters-Way-Pottstown-PA-19465/455065640_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 2, 3524, 6440, 2024, 'Sold', NULL, NULL, 535000.0, 26),
('Pottstown', '81 Painters Way', 'PA', '19465', 'https://www.zillow.com/homedetails/81-Painters-Way-Pottstown-PA-19465/351597615_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 3, 3361, 3640, 2024, 'Listing Removed', NULL, NULL, 557600.0, 27),
('Pottstown', '83 Painters Way', 'PA', '19465', 'https://www.zillow.com/homedetails/83-Painters-Way-Pottstown-PA-19465/350177186_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 2, 3524, 3652, 2024, 'Sold', NULL, NULL, 520000.0, 28),
('Pottstown', '123 Painters Way', 'PA', '19465', 'https://www.zillow.com/homedetails/123-Painters-Way-Pottstown-PA-19465/443004660_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 2, 3524, 4123, 2024, 'Sold', NULL, NULL, 526500.0, 29),
('Pottstown', '127 Painters Way', 'PA', '19465', 'https://www.zillow.com/homedetails/127-Painters-Way-Pottstown-PA-19465/443004845_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 2, 3546, 3703, 2024, 'Listing Removed', NULL, NULL, 526200.0, 30),
('Bridgeport', '9 East Front Street', 'PA', '19405', 'https://www.zillow.com/homedetails/9-E-Front-St-Bridgeport-PA-19405/460317276_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Single Family', NULL, 4, 4, 2060, 840, 2024, 'Sold', NULL, NULL, 532500.0, 31),
('Bridgeport', '11 East Front St', 'PA', '19405', 'https://www.zillow.com/homedetails/11-E-Front-St-Bridgeport-PA-19405/446239237_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', '2026-09-01', 4, 2, 2060, NULL, 2024, 'Available', 3495.0, 3595.0, NULL, 32),
('Bridgeport', '43 East Front St', 'PA', '19405', 'https://www.zillow.com/homedetails/43-E-Front-St-Bridgeport-PA-19405/450861599_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 4, 2319, NULL, 2025, 'Listing Removed', NULL, NULL, 550400.0, 33),
('Bridgeport', '51 East Front St', 'PA', '19405', 'https://www.zillow.com/homedetails/51-E-Front-St-Bridgeport-PA-19405/452961945_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 3, 2319, NULL, NULL, 'Sold', NULL, NULL, 475000.0, 34),
('Bridgeport', '2 Anderson Dr', 'PA', '19405', 'https://www.zillow.com/homedetails/2-Anderson-Dr-Bridgeport-PA-19405/349051051_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 5, 2319, NULL, 2024, 'Sold', NULL, NULL, 511214.0, 35),
('Bridgeport', '2 Kusy Terrace', 'PA', '19405', 'https://www.zillow.com/homedetails/2-Kusy-Ter-Bridgeport-PA-19405/460317210_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', 'Now', 4, 2, 2060, NULL, 2024, 'Available', 3595.0, 3575.0, NULL, 36),
('Bridgeport', '12 Kusy Terrace', 'PA', '19405', 'https://www.zillow.com/homedetails/12-Kusy-Ter-Bridgeport-PA-19405/439881037_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 4, 2319, NULL, NULL, 'Listing Removed', NULL, NULL, 515000.0, 37),
('Bridgeport', '7 Depot Street', 'PA', '19405', 'https://www.zillow.com/homedetails/7-Depot-St-Bridgeport-PA-19405/440239464_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 4, 2319, NULL, NULL, 'Sold', NULL, NULL, 520000.0, 38),
('Bridgeport', '4 Karpovich Alley', 'PA', '19405', 'https://www.zillow.com/homedetails/4-Karpovich-Aly-Bridgeport-PA-19405/443348695_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 5, 2319, NULL, 2024, 'Sold', NULL, NULL, 492843.0, 39),
('Bridgeport', '14 Karpovich Alley', 'PA', '19405', 'https://www.zillow.com/homedetails/14-Karpovich-Aly-Bridgeport-PA-19405/444974400_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 4, 2319, NULL, NULL, 'Listing Removed', NULL, NULL, 500000.0, 40),
('Bridgeport', '45 Tarmin Alley', 'PA', '19405', 'https://www.zillow.com/homedetails/45-Tarmin-Aly-Bridgeport-PA-19405/451818569_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 4, 2319, NULL, NULL, 'Listing Removed', NULL, NULL, 495000.0, 41),
('Bridgeport', '49 Continental Way', 'PA', '19405', 'https://www.zillow.com/homedetails/49-Continental-Way-Bridgeport-PA-19405/442550615_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', NULL, NULL, 3, 2, 1770, NULL, 2024, 'Listing Removed', NULL, NULL, 520000.0, 42),
('Bridgeport', '51 Continental Way', 'PA', '19405', 'https://www.zillow.com/homedetails/51-Continental-Way-Bridgeport-PA-19405/442551012_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', NULL, NULL, 3, 2, 1770, NULL, 2024, 'Listing Removed', NULL, NULL, 520000.0, 43),
('Bridgeport', '65 Continental Way', 'PA', '19405', 'https://www.zillow.com/homedetails/65-Continental-Dr-LOT-33-Bridgeport-PA-19405/444975545_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 3, 2225, NULL, NULL, 'Listing Removed', NULL, NULL, 457000.0, 44),
('Bridgeport', '69 Continental Way', 'PA', '19405', 'https://www.zillow.com/homedetails/69-Continental-Dr-LOT-35-Bridgeport-PA-19405/444996526_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 3, 2225, NULL, NULL, 'Listing Removed', NULL, NULL, 457000.0, 45),
('Bridgeport', '75 Continental Way', 'PA', '19405', 'https://www.zillow.com/homedetails/75-Continental-Way-Bridgeport-PA-19405/443799863_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 3, 2225, 920, 2025, 'Listing Removed', NULL, NULL, 479000.0, 46),
('Bridgeport', '77 Continental Way', 'PA', '19405', 'https://www.zillow.com/homedetails/77-Continental-Way-Bridgeport-PA-19405/443799860_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 3, 2225, 920, 2025, 'Sold', NULL, NULL, 510000.0, 47),
('Bridgeport', '79 Continental Way', 'PA', '19405', 'https://www.zillow.com/homedetails/79-Continental-Dr-LOT-40-Bridgeport-PA-19405/446808482_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 3, 2225, NULL, NULL, 'Listing Removed', NULL, NULL, 457000.0, 48),
('Bridgeport', '131 Continental Way', 'PA', '19405', 'https://www.zillow.com/homedetails/131-Continental-Way-Bridgeport-PA-19405/450735030_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 3, 2225, NULL, 2025, 'Sold', NULL, NULL, 507736.0, 49),
('Coatesville', '854 Cotrel Ln', 'PA', '19320', 'https://www.zillow.com/homedetails/854-Cotrel-Ln-Coatesville-PA-19320/338946565_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 3, 1509, 750, 2023, 'Sold', NULL, NULL, 226667.0, 50),
('Downingtown', '83 Four Leaf Dr', 'PA', '19335', 'https://www.zillow.com/homedetails/83-Four-Leaf-Dr-Downingtown-PA-19335/343543955_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 3, 1911, NULL, NULL, 'Listing Removed', NULL, NULL, 520000.0, 51),
('Phoenixville', '739 Platinum Dr', 'PA', '19460', 'https://www.zillow.com/homedetails/739-Platinum-Dr-Phoenixville-PA-19460/455157694_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 3, 1868, NULL, NULL, 'Listing Removed', NULL, NULL, 360300.0, 52),
('Phoenixville', '759 Platinum Dr', 'PA', '19460', 'https://www.zillow.com/homedetails/759-Platinum-Dr-Phoenixville-PA-19460/456883207_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 3, 1868, NULL, NULL, 'Listing Removed', NULL, NULL, 369700.0, 53),
('Phoenixville', '763 Platinum Dr', 'PA', '19460', 'https://www.zillow.com/homedetails/763-Platinum-Dr-Phoenixville-PA-19460/456305565_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 3, 1868, NULL, NULL, 'Listing Removed', NULL, NULL, 360300.0, 54),
('Bridgeport', '7 Moran Place', 'PA', '19405', 'https://www.zillow.com/homedetails/7-Moran-Pl-Bridgeport-PA-19405/457839899_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 4, 4, 2389, NULL, NULL, 'Listing Removed', NULL, NULL, 508500.0, 55),
('Bridgeport', '1 Atkins', 'PA', '19405', 'https://www.zillow.com/homedetails/1-Atkins-Dr-Bridgeport-PA-19405/458543881_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Listing Removed', NULL, NULL, 572600.0, 56),
(NULL, '17 Atkins', 'PA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unverified', NULL, NULL, NULL, 57),
('Bridgeport', '10 Barbine Way', 'PA', NULL, 'https://www.zillow.com/homedetails/10-Barbine-Way-Bridgeport-PA-19405/458619546_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Listing Removed', NULL, NULL, 506500.0, 58),
(NULL, '33 Anderson Dr', 'PA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unverified', NULL, NULL, NULL, 59),
('Pottstown', '89 Wil-Be Dr', 'PA', NULL, 'https://www.zillow.com/homedetails/89-Wil-Be-Dr-Pottstown-PA-19465/306711657_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', NULL, NULL, 3, 4, 1873, 2317, 2021, 'Listing Removed', NULL, NULL, 440800.0, 60),
('Phoenixville', '779 Platinum Dr', 'PA', '19460', 'https://www.zillow.com/homedetails/779-Platinum-Dr-Phoenixville-PA-19460/459019537_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 3, 1868, NULL, 2026, 'Listing Removed', NULL, NULL, 470200.0, 61),
('Phoenixville', '787 Platinum Dr', 'PA', '19460', 'https://www.zillow.com/homedetails/787-Platinum-Dr-Phoenixville-PA-19460/461256187_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 3, 1868, 3920, 2026, 'Listing Removed', NULL, NULL, 455180.0, 62),
('Phoenixville', '858 Graphite Dr', 'PA', '19460', 'https://www.zillow.com/homedetails/858-Graphite-Dr-Phoenixville-PA-19460/460814235_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', NULL, 3, 3, 1868, NULL, 2026, 'Listing Removed', NULL, NULL, 468400.0, 63),
('Spring City', '704 Peony Ln', 'PA', '19475', 'https://www.zillow.com/homedetails/704-Peony-Ln-Spring-City-PA-19475/442996660_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', 'Now', 3, 2, 2450, NULL, 2022, 'Available', 3595.0, 3495.0, NULL, 64),
('Phoenixville', '612 Brass Ln', 'PA', '19460', 'https://www.zillow.com/homedetails/612-Brass-Ln-Phoenixville-PA-19460/462391115_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', '2026-09-15', 3, 2, 1868, NULL, 2025, 'Available', 3200.0, 3150.0, NULL, 65),
('Phoenixville', '616 Brass Ln', 'PA', '19460', 'https://www.zillow.com/homedetails/616-Brass-Ln-Phoenixville-PA-19460/462131378_zpid/?utm_campaign=zillowwebmessage&utm_medium=referral&utm_source=txtshare', 'Townhouse', '2026-09-15', 3, 2, 1868, NULL, 2025, 'Available', 3200.0, 3150.0, NULL, 66);
