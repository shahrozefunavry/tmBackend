-- Modify `template` column data type
ALTER TABLE `form`
    MODIFY `template` longblob NOT NULL;

-- Set `visit_id` column default value and NOT NULL
ALTER TABLE `form`
    MODIFY `visit_id` int(11) NOT NULL DEFAULT '0';

-- Set default value for `created_at` column
ALTER TABLE `form`
    MODIFY `created_at` datetime DEFAULT CURRENT_TIMESTAMP;

-- Remove `appointment_id` column
ALTER TABLE `form`
    DROP COLUMN `appointment_id`;

-- Drop KEY `get_instance` and add UNIQUE KEY `UNIQUE_VISIT_ID`
ALTER TABLE `form`
    DROP INDEX `get_instance`,
    ADD UNIQUE KEY `UNIQUE_VISIT_ID` (`visit_id`);

