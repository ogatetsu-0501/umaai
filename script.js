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
function generateUniquePermutations(items, length) {
  let results = new Set();

  function permute(arr, m = []) {
    if (m.length === length) {
      results.add(m.slice().sort().toString());
      return;
    }
    for (let i = 0; i < arr.length; i++) {
      permute(arr, m.concat(arr[i]));
    }
  }

  permute(items);
  return Array.from(results).map((item) => item.split(","));
}
function generateCombinedPermutations() {
  let items = ["carrot", "garlic", "potato", "chili", "strawberry"];
  let uniquePermutations1 = generateUniquePermutations(items, 4);
  let uniquePermutations2 = generateUniquePermutations(items, 4);
  let uniquePermutations3 = generateUniquePermutations(items, 6);

  let combinedPermutations = [];

  for (let n = 0; n < uniquePermutations1.length; n++) {
    for (let m = 0; m < uniquePermutations2.length; m++) {
      for (let o = 0; o < uniquePermutations3.length; o++) {
        let combined = [
          ...uniquePermutations1[n],
          ...uniquePermutations2[m],
          ...uniquePermutations3[o],
        ];
        combinedPermutations.push(combined);
      }
    }
  }

  return combinedPermutations;
}

function initializeTurnData() {
  // 初期のレベルを取得する関数を呼び出す
  const initialLevels = getInitialLevels();

  // 初期の食べ物の数をオブジェクトとして取得する
  const initialFoodCounts = {
    carrot: getInitialFoodCount("carrot"), // 人参の初期数を取得
    garlic: getInitialFoodCount("garlic"), // ニンニクの初期数を取得
    potato: getInitialFoodCount("potato"), // じゃがいもの初期数を取得
    chili: getInitialFoodCount("chili"), // チリの初期数を取得
    strawberry: getInitialFoodCount("strawberry"), // いちごの初期数を取得
  };

  // 初期のフィールドポイントを取得する
  const initialFieldPoints = getFieldPoints();

  // 現在の組み合わせのターンデータを格納する配列
  let turnData = [];
  // 現在のフィールドポイントを初期値に設定
  let fieldPoints = initialFieldPoints;

  // 0ターンから14ターンまでループを回す
  for (let turn = 0; turn <= 14; turn++) {
    // 特定のターンでフィールドポイントを追加する
    if (turn === 5) {
      fieldPoints += 160; // 5ターン目で160ポイント追加
    } else if (turn === 9) {
      fieldPoints += 160; // 9ターン目で160ポイント追加
    } else if ([10, 11, 12, 13, 14].includes(turn)) {
      fieldPoints += 75; // 10ターン目から14ターン目まで75ポイント追加
    }

    // ターンデータを配列に追加
    turnData.push({
      turn: turn, // 現在のターン
      levels: { ...initialLevels }, // 現在のレベル
      foodCounts:
        turn === 0
          ? { ...initialFoodCounts } // 0ターン目は初期の食べ物の数
          : {
              carrot: 0, // それ以外のターンは食べ物の数は0
              garlic: 0,
              potato: 0,
              chili: 0,
              strawberry: 0,
            },
      fieldPoints: fieldPoints, // 現在のフィールドポイント
      selectedField: "", // 空のフィールドを選択
    });
  }

  // 現在のターンデータを返す
  return turnData;
}

function processTurnData(result) {
  // 収穫量を定義するオブジェクト
  const harvestAmounts = {
    1: 20,
    2: 30,
    3: 30,
    4: 40,
    5: 40,
  };
  // 基本収穫量を定義するオブジェクト
  const baseHarvestAmounts = {
    1: 20,
    2: 20,
    3: 30,
    4: 40,
    5: 40,
  };

  // 14ターン分のデータを処理する
  for (let turn = 1; turn <= 14; turn++) {
    // 各作物に対して処理を行う
    for (const crop in result[turn].foodCounts) {
      // 作物のレベルを取得する
      const level = result[turn].levels[crop];
      // 作物の収穫量を取得する
      const harvestAmount = harvestAmounts[level];
      // 基本収穫量を取得する
      const baseHarvestAmount = baseHarvestAmounts[level];
      // 前のターンの作物の数を取得する
      let previousFoodCount = result[turn - 1].foodCounts[crop];
      // 前のターンの増加量を取得する
      let previousIncrement = result[turn - 1].increment
        ? result[turn - 1].increment[crop]
        : 0;

      // 特定のターンに対する処理
      if ([1, 2, 3, 6, 7].includes(turn)) {
        // 前のターンの作物の数をそのまま保持する
        result[turn].foodCounts[crop] = previousFoodCount;
        // 選択された作物の場合、増加量を計算する
        if (result[turn].selectedField === crop) {
          result[turn].increment = result[turn].increment || {};
          result[turn].increment[crop] = Math.floor(
            previousIncrement + harvestAmount * 1.6
          );
        } else {
          // 選択されていない作物の場合、増加量を前のターンのままにする
          result[turn].increment = result[turn].increment || {};
          result[turn].increment[crop] = previousIncrement;
        }
      } else if ([4, 8].includes(turn)) {
        // 前のターンの作物の数をそのまま保持する
        result[turn].foodCounts[crop] = previousFoodCount;
        // 選択された作物の場合、増加量を計算する
        if (result[turn].selectedField === crop) {
          result[turn].increment = result[turn].increment || {};
          result[turn].increment[crop] = Math.floor(
            previousIncrement + harvestAmount * 1.6 + baseHarvestAmount * 1.6
          );
        } else {
          // 選択されていない作物の場合、増加量を計算する
          result[turn].increment = result[turn].increment || {};
          result[turn].increment[crop] = Math.floor(
            previousIncrement + baseHarvestAmount * 1.6
          );
        }
      } else if (turn === 5) {
        // 前のターンの作物の数に増加量を加える
        result[turn].foodCounts[crop] = previousIncrement + previousFoodCount;
        // 選択された作物の場合、増加量を計算する
        if (result[turn].selectedField === crop) {
          result[turn].increment = result[turn].increment || {};
          result[turn].increment[crop] = Math.floor(harvestAmount * 1.6);
        } else {
          // 選択されていない作物の場合、増加量を0にする
          result[turn].increment = result[turn].increment || {};
          result[turn].increment[crop] = 0;
        }
      } else if (turn === 9) {
        // 前のターンの作物の数に増加量を加え、80を引く
        result[turn].foodCounts[crop] =
          previousIncrement + previousFoodCount - 80;
        // 選択された作物の場合、増加量を計算する
        if (result[turn].selectedField === crop) {
          result[turn].increment = result[turn].increment || {};
          result[turn].increment[crop] =
            Math.floor(harvestAmount * 1.5) +
            Math.floor(Math.floor(baseHarvestAmount / 2) * 1.5);
        } else {
          // 選択されていない作物の場合、増加量を計算する
          result[turn].increment = result[turn].increment || {};
          result[turn].increment[crop] = Math.floor(
            Math.floor(baseHarvestAmount / 2) * 1.5
          );
        }
      } else if ([10, 11, 12, 13, 14].includes(turn)) {
        // 前のターンの作物の数に増加量を加え、80を引く
        result[turn].foodCounts[crop] =
          previousIncrement + previousFoodCount - 80;
        // 選択された作物の場合、増加量を計算する
        if (result[turn].selectedField === crop) {
          result[turn].increment = result[turn].increment || {};
          result[turn].increment[crop] =
            Math.floor(harvestAmount * 1.5) +
            Math.floor(Math.floor(baseHarvestAmount / 2) * 1.5);
        } else {
          // 選択されていない作物の場合、増加量を計算する
          result[turn].increment = result[turn].increment || {};
          result[turn].increment[crop] = Math.floor(
            Math.floor(baseHarvestAmount / 2) * 1.5
          );
        }
      }
    }
  }

  // すべてのターンデータを返す
  return result;
}
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
function adjustFieldPoints(result) {
  // すべての作物についてループを開始します
  for (const crop in result[0].levels) {
    // 各ターンについてループを開始します（最大14ターン）
    for (let turn = 0; turn < 14; turn++) {
      // 現在のターンの作物のレベルを取得します
      const currentLevel = result[turn].levels[crop];
      // 次のターンの作物のレベルを取得します
      const nextLevel = result[turn + 1].levels[crop];
      // 現在のレベルと次のレベルが異なる場合
      if (currentLevel !== nextLevel) {
        // レベルの変化を文字列として保存します
        const levelChange = `${currentLevel}→${nextLevel}`;
        // このレベル変化に必要なポイントが存在する場合
        if (fieldPointsRequired[levelChange]) {
          // 減らすべきポイントを取得します
          const pointsToDeduct = fieldPointsRequired[levelChange];
          // ポイントを減らすためにターンの後続を調整します
          for (let adjustTurn = turn + 1; adjustTurn <= 14; adjustTurn++) {
            // フィールドポイントを減らします
            result[adjustTurn].fieldPoints -= pointsToDeduct;
          }
        }
      }
    }
  }
  // 調整後の結果を返します
  return result;
}
document
  .getElementById("submitButton")
  .addEventListener("click", function (event) {
    event.preventDefault();
    let turnData = initializeTurnData();
    console.log(turnData);

    let result = processTurnData(turnData);
    console.log(result);

    // while (true) {
    //   let foundNegative = false;

    //   // 食材の個数がマイナスになっているターンを探します
    //   for (let turn = 1; turn <= 14; turn++) {
    //     // 各食材ごとに処理します
    //     for (const crop in result[turn].foodCounts) {
    //       console.log(turn, result[turn].foodCounts[crop], crop);
    //       if (result[turn].foodCounts[crop] < 0) {
    //         foundNegative = true;

    //         // マイナスになっているターン-nが0ならばresult[i]を削除し、ループを続行します
    //         if (turn - n <= 0) {
    //           console.log("削除", result[i]);
    //           result.splice(i, 1);
    //           i--; // インデックスを調整します
    //           return;
    //         }

    //         // 初期レベルを取得して、それに+1した値を入れます
    //         const initialLevels = getInitialLevels();
    //         for (let adjustTurn = turn - n; adjustTurn <= 14; adjustTurn++) {
    //           result[adjustTurn].levels[crop] = initialLevels[crop] + 1;
    //         }

    //         // ターンデータを再計算します
    //         result[i] = processTurnData(result[i]);
    //         break;
    //       }
    //     }

    //     if (foundNegative) {
    //       break;
    //     }
    //   }

    //   if (!foundNegative) {
    //     break;
    //   }

    //   // nを1増やします
    //   n += 1;
    // }
    // console.log(result);

    let branch = [];

    // 最初のデータをbranch配列の1つ目の要素として追加します
    let = branch[0] = result;

    console.log(result);
    console.log(branch);
    // 指定されたターンの値を含む配列を定義します
    const setTurns = [4, 8, 9, 10, 11, 12, 13, 14];
    // 指定された値に対して処理を行うためのfor...ofループ
    for (const turn of setTurns) {
      let doBranch = branch.slice(); // branchの浅いコピーを作成
      console.log(doBranch);
      for (let b = 0; b < doBranch.length; b++) {
        // 各ブランチを処理します
        let currentBranch = doBranch[b];
        let foodKeys = Object.keys(currentBranch[turn].levels);
        for (let m = 0; m < foodKeys.length; m++) {
          let crop = foodKeys[m]; // 現在の作物を取得します
          console.log(crop);
          let level = currentBranch[turn].levels[crop]; // 現在のレベルを取得します

          for (let i = 5 - level; i >= 1; i--) {
            console.log(level + i, "レベル");
            let nextLevel = level + i; // 次のレベルを計算します
            const levelChange = `${level}→${nextLevel}`; // レベルの変化を文字列として保存します
            let pointsToDeduct = fieldPointsRequired[levelChange]; // 必要なフィールドポイントを取得します
            let newBranch = JSON.parse(JSON.stringify(currentBranch)); // 現在のブランチのコピーを作成します
            let validBranch = true;
            for (let editTurn = turn; editTurn <= 14; editTurn++) {
              console.log(editTurn, "ターン目");
              console.log(validBranch);
              // ターンをループします
              if (newBranch[editTurn].levels[crop] < nextLevel) {
                // 次のレベルに満たない場合、更新します
                newBranch[editTurn].levels[crop] = nextLevel;
              }

              if (newBranch[editTurn].fieldPoints - pointsToDeduct < 0) {
                // ポイントが足りない場合、ループを終了します
                validBranch = false;
                console.log("ポイント不足");
                break;
              }

              newBranch[editTurn].fieldPoints -= pointsToDeduct; // ポイントを減少させます
            }

            if (validBranch) {
              // 有効なブランチならば、追加します

              console.log("追加");
              newBranch = processTurnData(newBranch);
              //todo
              // lastUpgradeオブジェクトを作成し、cropを設定します
              let lastUpgrade = { crop: crop };

              // newBranchにlastUpgradeオブジェクトを追加します
              newBranch.push(lastUpgrade);
              console.log(branch);
              branch.push(newBranch);
              console.log(
                `新しいbranchが追加されました: 作物 ${crop}, ターン${turn}, レベル ${level} から ${nextLevel}`
              );
              console.log(branch);
            }
          }
        }
      }
    }

    // 料理別の素材消費数を定義
    const foodRequirements = {
      サンド: { carrot: 25, garlic: 0, potato: 50, chili: 0, strawberry: 50 },
      カレー: { carrot: 25, garlic: 0, potato: 50, chili: 0, strawberry: 50 },
      クラシックポトフ: {
        carrot: 150,
        garlic: 0,
        potato: 80,
        chili: 0,
        strawberry: 0,
      },
      クラシックラーメン: {
        carrot: 0,
        garlic: 150,
        potato: 0,
        chili: 80,
        strawberry: 0,
      },
      クラシックピザ: {
        carrot: 0,
        garlic: 80,
        potato: 150,
        chili: 0,
        strawberry: 0,
      },
      クラシックマーボー: {
        carrot: 40,
        garlic: 0,
        potato: 40,
        chili: 150,
        strawberry: 0,
      },
      クラシックアイス: {
        carrot: 80,
        garlic: 0,
        potato: 0,
        chili: 0,
        strawberry: 150,
      },
      シニアポトフ: {
        carrot: 250,
        garlic: 0,
        potato: 80,
        chili: 0,
        strawberry: 0,
      },
      シニアラーメン: {
        carrot: 0,
        garlic: 250,
        potato: 0,
        chili: 80,
        strawberry: 0,
      },
      シニアピザ: {
        carrot: 0,
        garlic: 80,
        potato: 250,
        chili: 0,
        strawberry: 0,
      },
      シニアマーボー: {
        carrot: 40,
        garlic: 0,
        potato: 40,
        chili: 250,
        strawberry: 0,
      },
      シニアアイス: {
        carrot: 80,
        garlic: 0,
        potato: 0,
        chili: 0,
        strawberry: 250,
      },
    };

    for (let meal in foodRequirements) {
      let Lbranch = branch.slice(); // branchの浅いコピーを作成

      for (let n = 0; n < Lbranch.length; n++) {
        let currentBranch = JSON.parse(JSON.stringify(Lbranch[n])); // branch[n]をコピー
        let foodCounts = JSON.parse(
          JSON.stringify(currentBranch[14].foodCounts)
        ); // branch[n][14]のfoodCountsをコピー
        let mealCount = 0;
        while (true) {
          let canCook = true;

          // 料理の素材数をfoodCountsから引く
          for (let ingredient in foodRequirements[meal]) {
            if (
              foodCounts[ingredient] - foodRequirements[meal][ingredient] <
              0
            ) {
              canCook = false;
              break;
            }
          }

          if (!canCook) {
            break;
          }

          // 食材を引く
          for (let ingredient in foodRequirements[meal]) {
            foodCounts[ingredient] -= foodRequirements[meal][ingredient];
          }

          // 料理カウントを+1
          mealCount++;

          // LbranchにcurrentBranchを入れる
          let newBranch = JSON.parse(JSON.stringify(Lbranch[n]));
          newBranch[14].foodCounts = JSON.parse(JSON.stringify(foodCounts));
          newBranch[`${meal}Count`] = mealCount;

          branch.push(newBranch);
        }
      }
    }

    // 結果を出力
    console.log(branch);
  });
