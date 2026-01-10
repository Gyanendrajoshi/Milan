DELETE FROM EstimationProcessCosts;
DELETE FROM EstimationDetails;
DELETE FROM Estimations;
DBCC CHECKIDENT ('Estimations', RESEED, 0);
