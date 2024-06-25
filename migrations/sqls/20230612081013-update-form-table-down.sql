-- Modify `template` column data type
ALTER TABLE `form`
    MODIFY `template` longtext NOT NULL;

-- Remove default value and NOT NULL from `visit_id`
ALTER TABLE `form`
    MODIFY `visit_id` int(11) DEFAULT NULL;

-- Remove default value from `created_at` column
ALTER TABLE `form`
    MODIFY `created_at` datetime DEFAULT NULL;

-- Add `appointment_id` column
ALTER TABLE `form`
    ADD COLUMN `appointment_id` int(11) DEFAULT NULL AFTER `template`;

-- Drop UNIQUE KEY `UNIQUE_VISIT_ID` and add KEY `get_instance`
ALTER TABLE `form`
    DROP INDEX `UNIQUE_VISIT_ID`,
    ADD KEY `get_instance` (`visit_id`);
