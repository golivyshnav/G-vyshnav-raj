-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: localhost    Database: rb
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `register`
--

DROP TABLE IF EXISTS `register`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `register` (
  `name` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(10) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `register`
--

LOCK TABLES `register` WRITE;
/*!40000 ALTER TABLE `register` DISABLE KEYS */;
INSERT INTO `register` VALUES ('vijayalakshmi','chithajallu.vijayalakshmi@gmail.com','vijji','female');
/*!40000 ALTER TABLE `register` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resume_1`
--

DROP TABLE IF EXISTS `resume_1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resume_1` (
  `name` varchar(50) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` bigint DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `career` varchar(100) DEFAULT NULL,
  `about` varchar(100) DEFAULT NULL,
  `course` varchar(40) DEFAULT NULL,
  `college` varchar(50) DEFAULT NULL,
  `month` varchar(100) DEFAULT NULL,
  `year` varchar(20) DEFAULT NULL,
  `achiements` varchar(200) DEFAULT NULL,
  `skills` varchar(50) DEFAULT NULL,
  `father` varchar(50) DEFAULT NULL,
  `mother` varchar(50) DEFAULT NULL,
  `pa` varchar(100) DEFAULT NULL,
  `Declaration` varchar(100) DEFAULT NULL,
  `date` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resume_1`
--

LOCK TABLES `resume_1` WRITE;
/*!40000 ALTER TABLE `resume_1` DISABLE KEYS */;
INSERT INTO `resume_1` VALUES ('vijayalakshmi','2002-12-04','chithajallu.vijayalakshmi@gmail.com',987654321,'vijayawada','ap','something new about all the data','about my self is dead','bca','pbsc','April','2019','awards','skills','Nageswara rao','radhika','vij','all are correct','2023-07-05 11:31:34');
/*!40000 ALTER TABLE `resume_1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resume_2`
--

DROP TABLE IF EXISTS `resume_2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resume_2` (
  `name` varchar(50) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` bigint DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `career` varchar(100) DEFAULT NULL,
  `about` varchar(100) DEFAULT NULL,
  `course` varchar(40) DEFAULT NULL,
  `college` varchar(50) DEFAULT NULL,
  `month` varchar(100) DEFAULT NULL,
  `year` varchar(20) DEFAULT NULL,
  `achiements` varchar(200) DEFAULT NULL,
  `skills` varchar(50) DEFAULT NULL,
  `father` varchar(50) DEFAULT NULL,
  `mother` varchar(50) DEFAULT NULL,
  `pa` varchar(100) DEFAULT NULL,
  `Declaration` varchar(100) DEFAULT NULL,
  `date` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resume_2`
--

LOCK TABLES `resume_2` WRITE;
/*!40000 ALTER TABLE `resume_2` DISABLE KEYS */;
INSERT INTO `resume_2` VALUES ('vijayalakshmi','2000-12-04','chithajallu.vijayalakshmi@gmail.com',98764321,'vijayawada','ap','new','something','bca','PBSC','July','2019','NEW','ALL','Nageswara rao','radhika','VIJ','yah','2023-07-05 11:32:19');
/*!40000 ALTER TABLE `resume_2` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-07-05 11:33:43
