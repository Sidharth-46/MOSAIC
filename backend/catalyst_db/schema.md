# Zoho Catalyst Data Store Schema - MOSAIC

Because Zoho Catalyst Data Store does not support programmatic `CREATE TABLE` operations via its SDK, you must create the following schema exactly as detailed in the **Zoho Catalyst Console** under **Data Store**.

## Table Creation Rules
1. Create each table in the order listed below to respect Lookup (Foreign Key) constraints.
2. Every table automatically gets a `ROWID` (BigInt) as its primary key. We map ERD PKs (like `CaseMasterID`) to this `ROWID`.
3. For ERD tables that specify a VARCHAR PK (like `ActCode`), use the `ROWID` as the Catalyst PK and make the `ActCode` a Unique string column.
4. Mark appropriate fields as `Is Unique` where noted.
5. Mark fields as `Mandatory` as noted.
6. Create Indexes in the Catalyst console for fields marked `[INDEX]`.

---

## 1. State
- `StateName`: VarChar, Max Length: 255
- `NationalityID`: BigInt
- `Active`: Boolean

## 2. District
- `DistrictName`: VarChar, Max Length: 255
- `StateID`: Lookup -> `State`
- `Active`: Boolean

## 3. UnitType
- `UnitTypeName`: VarChar, Max Length: 255
- `CityDistState`: VarChar, Max Length: 255
- `Hierarchy`: BigInt
- `Active`: Boolean

## 4. Unit
- `UnitName`: VarChar, Max Length: 255
- `TypeID`: Lookup -> `UnitType`
- `ParentUnit`: Lookup -> `Unit` (Optional self-reference)
- `NationalityID`: BigInt
- `StateID`: Lookup -> `State`
- `DistrictID`: Lookup -> `District`
- `Active`: Boolean

## 5. Rank
- `RankName`: VarChar, Max Length: 255
- `Hierarchy`: BigInt
- `Active`: Boolean

## 6. Designation
- `DesignationName`: VarChar, Max Length: 255
- `Active`: Boolean
- `SortOrder`: BigInt

## 7. Employee
- `DistrictID`: Lookup -> `District`
- `UnitID`: Lookup -> `Unit`
- `RankID`: Lookup -> `Rank`
- `DesignationID`: Lookup -> `Designation`
- `KGID`: VarChar, Max Length: 255
- `FirstName`: VarChar, Max Length: 255
- `EmployeeDOB`: DateTime
- `GenderID`: BigInt
- `BloodGroupID`: BigInt
- `PhysicallyChallenged`: Boolean
- `AppointmentDate`: DateTime

## 8. Court
- `CourtName`: VarChar, Max Length: 255
- `DistrictID`: Lookup -> `District`
- `StateID`: Lookup -> `State`
- `Active`: Boolean

## 9. CaseCategory
- `LookupValue`: VarChar, Max Length: 255

## 10. GravityOffence
- `LookupValue`: VarChar, Max Length: 255

## 11. CrimeHead
- `CrimeGroupName`: VarChar, Max Length: 255
- `Active`: Boolean

## 12. CrimeSubHead
- `CrimeHeadID`: Lookup -> `CrimeHead`
- `CrimeHeadName`: VarChar, Max Length: 255
- `SeqID`: BigInt

## 13. Act
- `ActCode`: VarChar, Max Length: 255, Unique, [INDEX]
- `ActDescription`: VarChar, Max Length: 2000
- `ShortName`: VarChar, Max Length: 255
- `Active`: Boolean

## 14. Section
- `SectionCode`: VarChar, Max Length: 255
- `ActCode`: Lookup -> `Act`
- `SectionDescription`: VarChar, Max Length: 2000
- `Active`: Boolean

## 15. CrimeHeadActSection
- `CrimeHeadID`: Lookup -> `CrimeHead`
- `ActCode`: Lookup -> `Act`
- `SectionCode`: VarChar, Max Length: 255

## 16. CaseStatusMaster
- `CaseStatusName`: VarChar, Max Length: 255

## 17. CasteMaster
- `caste_master_name`: VarChar, Max Length: 255

## 18. ReligionMaster
- `ReligionName`: VarChar, Max Length: 255

## 19. OccupationMaster
- `OccupationName`: VarChar, Max Length: 255

## 20. CaseMaster
- `CrimeNo`: VarChar, Max Length: 255, Unique, [INDEX]
- `CaseNo`: VarChar, Max Length: 255
- `CrimeRegisteredDate`: DateTime
- `PolicePersonID`: Lookup -> `Employee`
- `PoliceStationID`: Lookup -> `Unit`
- `CaseCategoryID`: Lookup -> `CaseCategory`
- `GravityOffenceID`: Lookup -> `GravityOffence`
- `CrimeMajorHeadID`: Lookup -> `CrimeHead`
- `CrimeMinorHeadID`: Lookup -> `CrimeSubHead`
- `CaseStatusID`: Lookup -> `CaseStatusMaster`
- `CourtID`: Lookup -> `Court`

## 21. ComplainantDetails
- `CaseMasterID`: Lookup -> `CaseMaster`
- `ComplainantName`: VarChar, Max Length: 255
- `AgeYear`: BigInt
- `OccupationID`: Lookup -> `OccupationMaster`
- `ReligionID`: Lookup -> `ReligionMaster`
- `CasteID`: Lookup -> `CasteMaster`
- `GenderID`: BigInt

## 22. Victim
- `CaseMasterID`: Lookup -> `CaseMaster`
- `VictimName`: VarChar, Max Length: 255
- `AgeYear`: BigInt
- `GenderID`: BigInt
- `VictimPolice`: VarChar, Max Length: 50

## 23. Accused
- `CaseMasterID`: Lookup -> `CaseMaster`
- `AccusedName`: VarChar, Max Length: 255
- `AgeYear`: BigInt
- `GenderID`: BigInt
- `PersonID`: VarChar, Max Length: 255

## 24. ArrestSurrender
- `CaseMasterID`: Lookup -> `CaseMaster`
- `ArrestSurrenderTypeID`: BigInt
- `ArrestSurrenderDate`: DateTime
- `ArrestSurrenderStateId`: Lookup -> `State`
- `ArrestSurrenderDistrictId`: Lookup -> `District`
- `PoliceStationID`: Lookup -> `Unit`
- `IOID`: Lookup -> `Employee`
- `CourtID`: Lookup -> `Court`
- `AccusedMasterID`: Lookup -> `Accused`
- `IsAccused`: Boolean
- `IsComplainantAccused`: Boolean

## 25. ActSectionAssociation
- `CaseMasterID`: Lookup -> `CaseMaster`
- `ActID`: Lookup -> `Act`
- `SectionID`: Lookup -> `Section`
- `ActOrderID`: BigInt
- `SectionOrderID`: BigInt

## 26. ChargesheetDetails
- `CaseMasterID`: Lookup -> `CaseMaster`
- `csdate`: DateTime
- `cstype`: VarChar, Max Length: 50
- `PolicePersonID`: Lookup -> `Employee`
