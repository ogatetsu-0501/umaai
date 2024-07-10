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
        fieldPoints += 160;
      } else if ([10, 11, 12, 13, 14].includes(turn)) {
        fieldPoints += 75;
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
          turnData[turn].increment[crop] =
            Math.floor(harvestAmount * 1.5) +
            Math.floor(Math.floor(baseHarvestAmount / 2) * 1.5);
        } else {
          turnData[turn].increment = turnData[turn].increment || {};
          turnData[turn].increment[crop] = Math.floor(
            Math.floor(baseHarvestAmount / 2) * 1.5
          );
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

  return turnData;
}

document
  .getElementById("submitButton")
  .addEventListener("click", function (event) {
    event.preventDefault();
    let turnData = initializeTurnData();
    let result = processTurnData(turnData);

    let n = 1;

    while (true) {
      let foundNegative = false;

      // 各食材ごとに処理します
      for (const crop in result[0].foodCounts) {
        // 食材の個数がマイナスになっているターンを探します
        for (let turn = 1; turn <= 14; turn++) {
          if (result[turn].foodCounts[crop] < 0) {
            foundNegative = true;

            // マイナスになっているターン-nが0ならば処理を終了します
            if (turn - n <= 0) {
              console.log("処理を終了します。");
              console.log(result);
              return;
            }

            // 初期レベルを取得して、それに+1した値を入れます
            const initialLevels = getInitialLevels();
            for (let adjustTurn = turn - n; adjustTurn <= 14; adjustTurn++) {
              result[adjustTurn].levels[crop] = initialLevels[crop] + 1;
            }

            // ターンデータを再計算します
            result = processTurnData(result);
            break;
          }
        }

        if (foundNegative) {
          break;
        }
      }

      if (!foundNegative) {
        break;
      }

      // nを1増やします
      n += 1;
    }

    console.log("Negative values resolved:");
    console.log(result);

    // 追加の処理
    const fieldPointsRequired = {
      "1→2": 100,
      "1→3": 280,
      "1→4": 500,
      "1→5": 750,
      "2→3": 180,
      "2→4": 400,
      "2→5": 650,
      "3→4": 220,
      "3→5": 470,
      "4→5": 250,
    };

    for (const crop in result[0].levels) {
      for (let turn = 0; turn < 14; turn++) {
        const currentLevel = result[turn].levels[crop];
        const nextLevel = result[turn + 1].levels[crop];
        if (currentLevel !== nextLevel) {
          const levelChange = `${currentLevel}→${nextLevel}`;
          if (fieldPointsRequired[levelChange]) {
            const pointsToDeduct = fieldPointsRequired[levelChange];
            for (let adjustTurn = turn + 1; adjustTurn <= 14; adjustTurn++) {
              result[adjustTurn].fieldPoints -= pointsToDeduct;
            }
          }
        }
      }
    }

    console.log("Field points adjusted:");
    console.log(result);

    // 最初のデータをbranch配列に追加します
    let branch = [result];
    console.log("初期のbranch:");
    console.log(branch);

    // 指定されたターンの値を含む配列を定義します
    const setturns = [4, 8, 9, 10, 11, 12, 13, 14];

    // 指定された値に対して処理を行うためのforループ
    for (let n = 0; n < setturns.length; n++) {
      console.log("nextturn", setturns[n]);
      let Dobranch = branch.slice(); // branchの浅いコピーを作成
      for (let b = 0; b < Dobranch.length; b++) {
        // 各ブランチを処理します
        let currentBranch = Dobranch[b];
        console.log(Dobranch);
        console.log("start", b, currentBranch);

        // レベルのキーを配列として取得し、その配列の値のみループします
        let foodKeys = Object.keys(currentBranch[0].levels);
        for (let m = 0; m < foodKeys.length; m++) {
          let crop = foodKeys[m]; // 現在の作物を取得します
          let i = 1;
          while (true) {
            let validBranch = true; // ブランチが有効かどうかを確認します
            let level = currentBranch[setturns[n]].levels[crop]; // 現在のレベルを取得します
            console.log(crop, setturns[n], level, i, b); // 作物、ターン、レベルを表示します

            if (level + i > 5) {
              // レベルが5を超えるかどうかを確認します
              console.log("nextfood");
              break;
            }

            let nextLevel = level + i; // 次のレベルを計算します
            const levelChange = `${level}→${nextLevel}`; // レベルの変化を文字列として保存します
            let pointsToDeduct = fieldPointsRequired[levelChange]; // 必要なフィールドポイントを取得します
            let newBranch = JSON.parse(JSON.stringify(currentBranch)); // 現在のブランチのコピーを作成します

            for (let turn = setturns[n]; turn <= 14; turn++) {
              // ターンをループします
              if (newBranch[turn].levels[crop] < nextLevel) {
                // 次のレベルに満たない場合、更新します
                newBranch[turn].levels[crop] = nextLevel;
              }

              if (newBranch[turn].fieldPoints - pointsToDeduct < 0) {
                // ポイントが足りない場合、ループを終了します
                console.log("nextlevel", i);
                validBranch = false;
                break;
              }

              newBranch[turn].fieldPoints -= pointsToDeduct; // ポイントを減少させます
            }

            if (validBranch) {
              // 有効なブランチならば、追加します
              newBranch = processTurnData(newBranch);
              branch.push(newBranch);
              console.log(
                `新しいbranchが追加されました: 作物 ${crop}, ターン${setturns[n]}, レベル ${level} から ${nextLevel}`
              );
              console.log(newBranch);
            }

            i++;
          }
        }
      }
    }

    console.log("最終的なbranch:");
    console.log(branch);
    // branch配列のn個目の14の値を抜き出す
    for (let n = 0; n < branch.length; n++) {
      let value14 = branch[n][14];
      console.log(`branchの${n}番目の14の値:`, value14);
    }
  });
