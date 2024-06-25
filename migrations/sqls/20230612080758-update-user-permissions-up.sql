-- Remove foreign key `template_user_permissions_ibfk_1`
ALTER TABLE `template_user_permissions`
    DROP FOREIGN KEY `template_user_permissions_ibfk_1`;

-- Set NOT NULL for `location_id`, `speciality_id`, `visit_type_id`, `template_id`, `case_type`
ALTER TABLE `template_user_permissions`
    MODIFY `location_id` int(11) NOT NULL,
    MODIFY `speciality_id` int(11) NOT NULL,
    MODIFY `visit_type_id` int(11) NOT NULL,
    MODIFY `template_id` int(11) NOT NULL,
    MODIFY `case_type` int(11) NOT NULL;

-- Alter `is_default` column data type and default value
ALTER TABLE `template_user_permissions`
    MODIFY `is_default` varchar(45) DEFAULT '0';

-- Add foreign key `fk_permissions_template`
ALTER TABLE `template_user_permissions`
    ADD CONSTRAINT `fk_permissions_template` FOREIGN KEY (`template_id`) REFERENCES `template` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop UNIQUE key `uniq_template_permissions` and create a new one
ALTER TABLE `template_user_permissions`
    DROP INDEX `uniq_template_permissions`,
    ADD UNIQUE KEY `uniq_template_permissions` (`location_id`,`speciality_id`,`visit_type_id`,`template_id`,`case_type`,`user_id`);
