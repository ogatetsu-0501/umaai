function getInitialLevels() {
  return {
    carrot: parseInt(document.getElementById("carrot_level").value, 10),
    garlic: parseInt(document.getElementById("garlic_level").value, 10),
    potato: parseInt(document.getElementById("potato_level").value, 10),
    chili: parseInt(document.getElementById("chili_level").value, 10),
    strawberry: parseInt(document.getElementById("strawberry_level").value, 10),
  };
}

function getInitialFoodCount(food) {
  return parseInt(document.getElementById(food + "_count").value, 10) || 0;
}

function getFieldPoints() {
  return parseInt(document.getElementById("field_points").value, 10) || 0;
}

function initializeTurnData() {
  const initialLevels = getInitialLevels();
  const initialFoodCounts = {
    carrot: getInitialFoodCount("carrot"),
    garlic: getInitialFoodCount("garlic"),
    potato: getInitialFoodCount("potato"),
    chili: getInitialFoodCount("chili"),
    strawberry: getInitialFoodCount("strawberry"),
  };
  const initialFieldPoints = getFieldPoints();

  const selectedFields = [
    "",
    "carrot",
    "carrot",
    "carrot",
    "carrot",
    "carrot",
    "carrot",
    "carrot",
    "carrot",
    "carrot",
    "carrot",
    "carrot",
    "carrot",
    "carrot",
  ];

  const turnData = [];

  for (let turn = 0; turn <= 14; turn++) {
    let fieldPoints;

    if (turn === 0) {
      fieldPoints = initialFieldPoints;
    } else {
      fieldPoints = turnData[turn - 1].fieldPoints;
      if (turn === 5) {
        fieldPoints += 160;
      } else if (turn === 9) {
        fieldPoints += 160 - 80;
      } else if ([10, 11, 12, 13, 14].includes(turn)) {
        fieldPoints += 75 - 80;
      }
    }

    turnData.push({
      turn: turn,
      levels: { ...initialLevels },
      foodCounts:
        turn === 0
          ? { ...initialFoodCounts }
          : {
              carrot: 0,
              garlic: 0,
              potato: 0,
              chili: 0,
              strawberry: 0,
            },
      fieldPoints: fieldPoints,
      selectedField: selectedFields[turn],
    });
  }

  return turnData;
}

function processTurnData(turnData) {
  const harvestAmounts = {
    1: 20,
    2: 30,
    3: 30,
    4: 40,
    5: 40,
  };
  const baseHarvestAmounts = {
    1: 20,
    2: 20,
    3: 30,
    4: 40,
    5: 40,
  };

  for (let turn = 1; turn <= 14; turn++) {
    for (const crop in turnData[turn].foodCounts) {
      const level = turnData[turn].levels[crop];
      const harvestAmount = harvestAmounts[level];
      const baseHarvestAmount = baseHarvestAmounts[level];
      let previousFoodCount = turnData[turn - 1].foodCounts[crop];
      let previousIncrement = turnData[turn - 1].increment
        ? turnData[turn - 1].increment[crop]
        : 0;

      if ([1, 2, 3, 6, 7].includes(turn)) {
        turnData[turn].foodCounts[crop] = previousFoodCount;
        if (turnData[turn].selectedField === crop) {
          turnData[turn].increment = turnData[turn].increment || {};
          turnData[turn].increment[crop] = Math.floor(
            previousIncrement + harvestAmount * 1.6
          );
        } else {
          turnData[turn].increment = turnData[turn].increment || {};
          turnData[turn].increment[crop] = previousIncrement;
        }
      } else if ([4, 8].includes(turn)) {
        turnData[turn].foodCounts[crop] = previousFoodCount;
        if (turnData[turn].selectedField === crop) {
          turnData[turn].increment = turnData[turn].increment || {};
          turnData[turn].increment[crop] = Math.floor(
            previousIncrement + harvestAmount * 1.6 + baseHarvestAmount * 1.6
          );
        } else {
          turnData[turn].increment = turnData[turn].increment || {};
          turnData[turn].increment[crop] = Math.floor(
            previousIncrement + baseHarvestAmount * 1.6
          );
        }
      } else if (turn === 5) {
        turnData[turn].foodCounts[crop] = previousIncrement + previousFoodCount;
        if (turnData[turn].selectedField === crop) {
          turnData[turn].increment = turnData[turn].increment || {};
          turnData[turn].increment[crop] = Math.floor(harvestAmount * 1.6);
        } else {
          turnData[turn].increment = turnData[turn].increment || {};
          turnData[turn].increment[crop] = 0;
        }
      } else if (turn === 9) {
        turnData[turn].foodCounts[crop] =
          previousIncrement + previousFoodCount - 80;
        if (turnData[turn].selectedField === crop) {
          turnData[turn].increment = turnData[turn].increment || {};
          turnData[turn].increment[crop] = Math.floor(harvestAmount * 1.6);
        } else {
          turnData[turn].increment = turnData[turn].increment || {};
          turnData[turn].increment[crop] = 0;
        }
      } else if ([10, 11, 12, 13, 14].includes(turn)) {
        turnData[turn].foodCounts[crop] =
          previousIncrement + previousFoodCount - 80;
        if (turnData[turn].selectedField === crop) {
          turnData[turn].increment = turnData[turn].increment || {};
          turnData[turn].increment[crop] =
            Math.floor(harvestAmount * 1.5) +
            Math.floor(Math.floor(baseHarvestAmount / 2) * 1.5);
        } else {
          turnData[turn].increment = turnData[turn].increment || {};
          turnData[turn].increment[crop] = Math.floor(
            Math.floor(baseHarvestAmount / 2) * 1.5
          );
        }
      }
    }
  }

  console.log(turnData);
}

document
  .getElementById("submitButton")
  .addEventListener("click", function (event) {
    event.preventDefault();
    const turnData = initializeTurnData();
    processTurnData(turnData);
  });
