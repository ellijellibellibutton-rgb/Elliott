-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ScoringCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'FIXED',
    "statKind" TEXT NOT NULL DEFAULT 'BONUS',
    "pointValue" REAL NOT NULL DEFAULT 0,
    "pointsPer100" REAL NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ScoringCategory" ("createdAt", "description", "enabled", "id", "isDemo", "name", "order", "pointValue", "pointsPer100", "type", "updatedAt") SELECT "createdAt", "description", "enabled", "id", "isDemo", "name", "order", "pointValue", "pointsPer100", "type", "updatedAt" FROM "ScoringCategory";
DROP TABLE "ScoringCategory";
ALTER TABLE "new_ScoringCategory" RENAME TO "ScoringCategory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
