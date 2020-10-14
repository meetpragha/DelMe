CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_name` varchar(45) NOT NULL,
  `mobile_no` bigint NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(45) NOT NULL,
  PRIMARY KEY (`id`,`mobile_no`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `buy_request` (
    `id` int NOT NULL AUTO_INCREMENT,
    `buyer` int NOT NULL,
    `pname` varchar(45) NOT NULL,
    `pprice` int NOT NULL,
    `pdesc` varchar(255) NOT NULL,
    `rprice` int NOT NULL,
    `lat1` float NOT NULL,
    `lng1` float NOT NULL,
    `lat2` float NOT NULL,
    `lng2` float NOT NULL,
    `pimage` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `id_idx` (`buyer`),
    CONSTRAINT `id` FOREIGN KEY (`buyer`) REFERENCES `users` (`id`)
  ) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `helper_details` (
  `hid` int NOT NULL,
  `lat1` float NOT NULL,
  `lng1` float NOT NULL,
  `lat2` float NOT NULL,
  `lng2` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  

  
  