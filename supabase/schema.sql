-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Commanders Table
CREATE TABLE commanders (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  faction TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table (for tracking unique submissions)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fingerprint TEXT NOT NULL UNIQUE,
  ip_hash TEXT,
  user_agent TEXT,
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions Table
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  submission_data JSONB NOT NULL, -- Will store the entire tier list
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- Ensures one submission per user
);

-- Insert StarCraft 2 Co-op Commanders
INSERT INTO commanders (name, faction, image_url) VALUES
('Raynor', 'Terran', 'https://static.wikia.nocookie.net/starcraft/images/3/3d/Raynor_SC2_Head1.jpg'),
('Swann', 'Terran', 'https://static.wikia.nocookie.net/starcraft/images/7/75/Swann_SC2_Head1.jpg'),
('Nova', 'Terran', 'https://static.wikia.nocookie.net/starcraft/images/b/b4/Nova_SC2_Head5.jpg'),
('Han & Horner', 'Terran', 'https://static.wikia.nocookie.net/starcraft/images/3/3c/HanHorner_SC2_Head1.jpg'),
('Mengsk', 'Terran', 'https://static.wikia.nocookie.net/starcraft/images/5/5a/Mengsk_SC2_Head1.jpg'),
('Kerrigan', 'Zerg', 'https://static.wikia.nocookie.net/starcraft/images/d/d9/SarahKerrigan_SC2_Head6.jpg'),
('Zagara', 'Zerg', 'https://static.wikia.nocookie.net/starcraft/images/7/71/Zagara_SC2_Head2.jpg'),
('Abathur', 'Zerg', 'https://static.wikia.nocookie.net/starcraft/images/8/8e/Abathur_SC2_Head2.jpg'),
('Dehaka', 'Zerg', 'https://static.wikia.nocookie.net/starcraft/images/c/c6/Dehaka_SC2_Head2.jpg'),
('Stukov', 'Zerg', 'https://static.wikia.nocookie.net/starcraft/images/c/c4/Stukov_SC2_Head2.jpg'),
('Artanis', 'Protoss', 'https://static.wikia.nocookie.net/starcraft/images/8/8b/Artanis_SC2_Head3.jpg'),
('Vorazun', 'Protoss', 'https://static.wikia.nocookie.net/starcraft/images/9/9d/Vorazun_SC2_Head1.jpg'),
('Karax', 'Protoss', 'https://static.wikia.nocookie.net/starcraft/images/a/a0/Karax_SC2_Head1.jpg'),
('Alarak', 'Protoss', 'https://static.wikia.nocookie.net/starcraft/images/3/31/Alarak_SC2_Head1.jpg'),
('Fenix', 'Protoss', 'https://static.wikia.nocookie.net/starcraft/images/d/d8/Fenix_SC2_Head1.jpg'),
('Zeratul', 'Protoss', 'https://static.wikia.nocookie.net/starcraft/images/4/40/Zeratul_SC2_Head2.jpg');
