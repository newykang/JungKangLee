CREATE TABLE `release_votes` (
  `release_id` text NOT NULL,
  `voter_key` text NOT NULL,
  `vote` text NOT NULL CHECK (`vote` IN ('like', 'dislike')),
  PRIMARY KEY (`release_id`, `voter_key`)
);
