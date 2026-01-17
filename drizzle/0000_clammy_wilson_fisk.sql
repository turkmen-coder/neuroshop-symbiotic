CREATE TABLE `action_guards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`guard_type` enum('high_value_purchase','impulse_detected','ethical_concern','pattern_deviation','ai_low_confidence') NOT NULL,
	`trigger_condition` text NOT NULL,
	`prompt_message` text NOT NULL,
	`required_action` enum('confirmation','reasoning_prompt','cooling_period','budget_review') NOT NULL,
	`status` enum('pending','approved','rejected','expired') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`resolved_at` timestamp,
	CONSTRAINT `action_guards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `archival_memory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`content` text NOT NULL,
	`embedding` json,
	`category` varchar(64),
	`importance` int NOT NULL DEFAULT 5,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `archival_memory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `behavior_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`session_id` varchar(64) NOT NULL,
	`click_speed` float,
	`scroll_depth` float,
	`hover_duration` float,
	`product_view_time` float,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `behavior_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budget_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`monthly_budget` float NOT NULL,
	`current_spending` float NOT NULL DEFAULT 0,
	`month` varchar(7) NOT NULL,
	`alert_threshold` float NOT NULL DEFAULT 0.8,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budget_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `canvas_artifacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`artifact_type` enum('product','research_result','note','comparison') NOT NULL,
	`title` text NOT NULL,
	`content` json NOT NULL,
	`position_x` float NOT NULL DEFAULT 0,
	`position_y` float NOT NULL DEFAULT 0,
	`width` float NOT NULL DEFAULT 300,
	`height` float NOT NULL DEFAULT 200,
	`z_index` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `canvas_artifacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conditional_delegations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`watch_list_id` int NOT NULL,
	`condition` text NOT NULL,
	`action` enum('notify','reserve','auto_buy') NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`executed_at` timestamp,
	CONSTRAINT `conditional_delegations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversation_context` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`session_id` varchar(64) NOT NULL,
	`messages` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversation_context_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `core_memory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`relationship_state` enum('stranger','acquaintance','partner') NOT NULL DEFAULT 'stranger',
	`trust_score` int NOT NULL DEFAULT 0,
	`active_goals` json NOT NULL,
	`price_range` json,
	`favorite_categories` json NOT NULL,
	`idiosyncrasies` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `core_memory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`watch_list_id` int NOT NULL,
	`alert_type` enum('target_reached','significant_drop','lowest_ever','trust_warning','budget_conflict') NOT NULL,
	`old_price` float,
	`new_price` float NOT NULL,
	`reasoning` text,
	`requires_approval` boolean NOT NULL DEFAULT false,
	`user_response` enum('pending','accepted','rejected','ignored') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`responded_at` timestamp,
	CONSTRAINT `price_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`watch_list_id` int NOT NULL,
	`price` float NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `price_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_predictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`watch_list_id` int NOT NULL,
	`predicted_price` float NOT NULL,
	`confidence` float NOT NULL,
	`timeframe` varchar(32) NOT NULL,
	`reasoning` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `price_predictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_watch_list` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`current_price` float NOT NULL,
	`target_price` float,
	`source` varchar(128),
	`image_url` text,
	`last_checked` timestamp NOT NULL DEFAULT (now()),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `price_watch_list_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recall_memory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`event_type` enum('search_query','product_view','product_reject','product_approve','canvas_action','chat_message') NOT NULL,
	`event_data` json NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recall_memory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recommendation_explanations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`product_id` varchar(128),
	`score` int NOT NULL,
	`reasoning` json NOT NULL,
	`user_feedback` enum('helpful','not_helpful','misleading'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recommendation_explanations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_maturity_level` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`current_level` enum('tool','copilot','partner') NOT NULL DEFAULT 'tool',
	`interaction_count` int NOT NULL DEFAULT 0,
	`last_level_change` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_maturity_level_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_maturity_level_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `user_personality_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`openness` int NOT NULL DEFAULT 50,
	`conscientiousness` int NOT NULL DEFAULT 50,
	`extraversion` int NOT NULL DEFAULT 50,
	`agreeableness` int NOT NULL DEFAULT 50,
	`neuroticism` int NOT NULL DEFAULT 50,
	`dominant_trait` varchar(64),
	`last_analyzed` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_personality_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_personality_profiles_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `user_status_idx` ON `action_guards` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `user_category_idx` ON `archival_memory` (`user_id`,`category`);--> statement-breakpoint
CREATE INDEX `user_session_idx` ON `behavior_metrics` (`user_id`,`session_id`);--> statement-breakpoint
CREATE INDEX `user_month_idx` ON `budget_tracking` (`user_id`,`month`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `canvas_artifacts` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_active_idx` ON `conditional_delegations` (`user_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `user_session_idx` ON `conversation_context` (`user_id`,`session_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `core_memory` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_response_idx` ON `price_alerts` (`user_id`,`user_response`);--> statement-breakpoint
CREATE INDEX `watch_list_timestamp_idx` ON `price_history` (`watch_list_id`,`timestamp`);--> statement-breakpoint
CREATE INDEX `user_active_idx` ON `price_watch_list` (`user_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `user_timestamp_idx` ON `recall_memory` (`user_id`,`timestamp`);--> statement-breakpoint
CREATE INDEX `user_product_idx` ON `recommendation_explanations` (`user_id`,`product_id`);