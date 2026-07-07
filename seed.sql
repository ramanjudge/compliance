-- 1. States
INSERT INTO states (id, name, slug, update_frequency) VALUES 
('dl', 'Delhi', 'delhi', 'Biannual (April, Oct)'),
('hr', 'Haryana', 'haryana', 'Biannual (Jan, July)'),
('up', 'Uttar Pradesh', 'uttar-pradesh', 'Biannual (April, Oct)'),
('ka', 'Karnataka', 'karnataka', 'Annual (April)');

-- 2. City Zones
INSERT INTO city_zones (id, state_id, city_name, zone_name) VALUES 
('gurugram', 'hr', 'Gurugram', 'Zone A'),
('faridabad', 'hr', 'Faridabad', 'Zone A'),
('panipat', 'hr', 'Panipat', 'Zone A'),
('rohtak', 'hr', 'Rohtak', 'Zone B'),
('bengaluru', 'ka', 'Bengaluru', 'Zone I'),
('mysuru', 'ka', 'Mysuru', 'Zone II'),
('mangalore', 'ka', 'Mangalore', 'Zone II'),
('hassan', 'ka', 'Hassan', 'Zone III'),
('noida', 'up', 'Noida', 'Zone A'),
('lucknow', 'up', 'Lucknow', 'Zone A'),
('agra', 'up', 'Agra', 'Zone B');

-- 3. Wages Mock Data (Using realistic but mock numbers)
-- Dates in unix epoch timestamp

-- Delhi (Flat rates, just Categories)
INSERT INTO wages (id, state_id, zone, industry, skill_level, category, basic_wage, vda, hra, effective_from, source_url) VALUES 
('dl_1', 'dl', NULL, 'All Scheduled Employments', 'Unskilled', 'General', 17494, 0, 0, 1711929600000, 'https://labour.delhi.gov.in/'),
('dl_2', 'dl', NULL, 'All Scheduled Employments', 'Semi-skilled', 'General', 19279, 0, 0, 1711929600000, 'https://labour.delhi.gov.in/'),
('dl_3', 'dl', NULL, 'All Scheduled Employments', 'Skilled', 'General', 21215, 0, 0, 1711929600000, 'https://labour.delhi.gov.in/'),
('dl_4', 'dl', NULL, 'All Scheduled Employments', 'Clerical', 'Non-Matriculates', 19279, 0, 0, 1711929600000, 'https://labour.delhi.gov.in/'),
('dl_5', 'dl', NULL, 'All Scheduled Employments', 'Clerical', 'Matriculates', 21215, 0, 0, 1711929600000, 'https://labour.delhi.gov.in/');

-- Haryana (Zone A)
INSERT INTO wages (id, state_id, zone, industry, skill_level, category, basic_wage, vda, hra, effective_from, source_url) VALUES 
('hr_1', 'hr', 'Zone A', 'General', 'Unskilled', 'General', 10532.61, 521, 0, 1704067200000, 'https://hrylabour.gov.in/'),
('hr_2', 'hr', 'Zone A', 'General', 'Semi-skilled', 'General', 11059.24, 547, 0, 1704067200000, 'https://hrylabour.gov.in/'),
('hr_3', 'hr', 'Zone A', 'General', 'Skilled', 'General', 11612.20, 575, 0, 1704067200000, 'https://hrylabour.gov.in/'),
('hr_4', 'hr', 'Zone A', 'Security', 'Security Guard', 'Without Arms', 11059.24, 547, 0, 1704067200000, 'https://hrylabour.gov.in/'),
('hr_5', 'hr', 'Zone A', 'Security', 'Security Guard', 'With Arms', 11612.20, 575, 0, 1704067200000, 'https://hrylabour.gov.in/');

-- Karnataka (Zone I - Bengaluru) - Typically uses basic + VDA per point
INSERT INTO wages (id, state_id, zone, industry, skill_level, category, basic_wage, vda, hra, effective_from, source_url) VALUES 
('ka_1', 'ka', 'Zone I', 'Shops & Establishments', 'Unskilled', 'Helper', 13500, 2500, 0, 1711929600000, 'https://labour.karnataka.gov.in/'),
('ka_2', 'ka', 'Zone I', 'Shops & Establishments', 'Semi-skilled', 'Assistant', 14500, 2500, 0, 1711929600000, 'https://labour.karnataka.gov.in/'),
('ka_3', 'ka', 'Zone I', 'Shops & Establishments', 'Skilled', 'Manager', 15500, 2500, 0, 1711929600000, 'https://labour.karnataka.gov.in/'),
('ka_4', 'ka', 'Zone I', 'Security Agency', 'Security Guard', 'General', 14500, 2500, 0, 1711929600000, 'https://labour.karnataka.gov.in/');

-- UP 
INSERT INTO wages (id, state_id, zone, industry, skill_level, category, basic_wage, vda, hra, effective_from, source_url) VALUES 
('up_1', 'up', NULL, 'General', 'Unskilled', 'General', 10275, 300, 0, 1711929600000, 'https://uplabour.gov.in/'),
('up_2', 'up', NULL, 'General', 'Semi-skilled', 'General', 11303, 330, 0, 1711929600000, 'https://uplabour.gov.in/'),
('up_3', 'up', NULL, 'General', 'Skilled', 'General', 12674, 370, 0, 1711929600000, 'https://uplabour.gov.in/');
