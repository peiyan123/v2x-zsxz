const testJson = {
  image_width: 1920,
  image_height: 1080,
  in_type: 'distort',
  center: { latitude: 31.5841128828, longitude: 120.4169874292 },
  in_params:
    '1878.4779052734375,0.00000000,952.63232421875,0.00000000,1879.6148681640625,538.6544189453125,0.0000000,0.00000000,1.00000000,0.32501161098480225,-0.31161433458328247,0.00273350952193141,0.00004785439887200482,0.6769999265670776',
  mode: 'LL',
  out_params_mark: [
    { img_x: 598, img_y: 480, latitude: 31.5841296132, longitude: 120.4172103288, world_x: 0, world_y: 0 },
    { img_x: 611, img_y: 341, latitude: 31.5841260037, longitude: 120.4172954598, world_x: 0, world_y: 0 },
    { img_x: 608, img_y: 267, latitude: 31.5841252418, longitude: 120.417369995, world_x: 0, world_y: 0 },
    { img_x: 610, img_y: 216, latitude: 31.584122501, longitude: 120.4174449755, world_x: 0, world_y: 0 },
    { img_x: 610, img_y: 162, latitude: 31.5841197843, longitude: 120.4175585168, world_x: 0, world_y: 0 },
    { img_x: 913, img_y: 472, latitude: 31.584096226, longitude: 120.4172050358, world_x: 0, world_y: 0 },
    { img_x: 838, img_y: 330, latitude: 31.5840935102, longitude: 120.4172949135, world_x: 0, world_y: 0 },
    { img_x: 791, img_y: 238, latitude: 31.5840898233, longitude: 120.4173990325, world_x: 0, world_y: 0 },
    { img_x: 765, img_y: 190, latitude: 31.5840869945, longitude: 120.4174842862, world_x: 0, world_y: 0 },
    { img_x: 765, img_y: 152, latitude: 31.584078742, longitude: 120.4175732653, world_x: 0, world_y: 0 },
    { img_x: 1240, img_y: 451, latitude: 31.584059333, longitude: 120.4172043512, world_x: 0, world_y: 0 },
    { img_x: 1125, img_y: 320, latitude: 31.584050415, longitude: 120.4172918722, world_x: 0, world_y: 0 },
    { img_x: 1038, img_y: 229, latitude: 31.5840414598, longitude: 120.4173980212, world_x: 0, world_y: 0 },
    { img_x: 982, img_y: 183, latitude: 31.5840363235, longitude: 120.4174822515, world_x: 0, world_y: 0 },
    { img_x: 939, img_y: 150, latitude: 31.5840333532, longitude: 120.4175648133, world_x: 0, world_y: 0 },
    { img_x: 1578, img_y: 416, latitude: 31.5840149942, longitude: 120.4172115553, world_x: 0, world_y: 0 },
    { img_x: 1365, img_y: 307, latitude: 31.5840116898, longitude: 120.4172926657, world_x: 0, world_y: 0 },
    { img_x: 1214, img_y: 227, latitude: 31.5840069315, longitude: 120.4173927222, world_x: 0, world_y: 0 },
    { img_x: 1156, img_y: 191, latitude: 31.5840018943, longitude: 120.417455689, world_x: 0, world_y: 0 },
    { img_x: 1087, img_y: 149, latitude: 31.5839940833, longitude: 120.4175576917, world_x: 0, world_y: 0 },
    { img_x: 1907, img_y: 398, latitude: 31.583971154, longitude: 120.41721056, world_x: 0, world_y: 0 },
    { img_x: 1665, img_y: 311, latitude: 31.5839686973, longitude: 120.4172779222, world_x: 0, world_y: 0 },
    { img_x: 1453, img_y: 235, latitude: 31.5839656477, longitude: 120.4173690835, world_x: 0, world_y: 0 },
    { img_x: 1379, img_y: 180, latitude: 31.583946084, longitude: 120.417462151, world_x: 0, world_y: 0 },
    { img_x: 1256, img_y: 162, latitude: 31.583961164, longitude: 120.4175089342, world_x: 0, world_y: 0 },
  ],
}

// const testJson = {"center": 555}
// const testJson = "{\"image_width\": 1920,\"image_height\": 1080,\"in_type\": \"distort\",\"center\":{\"latitude\":31.5841128828,\"longitude\":120.4169874292},\"in_params\":\"1878.4779052734375,0.00000000,952.63232421875,0.00000000,1879.6148681640625,538.6544189453125,0.0000000,0.00000000,1.00000000,0.32501161098480225,-0.31161433458328247,0.00273350952193141,0.00004785439887200482,0.6769999265670776\",\"mode\":\"LL\",\"out_params_mark\":[{\"img_x\":598,\"img_y\":480,\"latitude\":31.5841296132,\"longitude\":120.4172103288,\"world_x\":0,\"world_y\":0},{\"img_x\":611,\"img_y\":341,\"latitude\":31.5841260037,\"longitude\":120.4172954598,\"world_x\":0,\"world_y\":0},{\"img_x\":608,\"img_y\":267,\"latitude\":31.5841252418,\"longitude\":120.417369995,\"world_x\":0,\"world_y\":0},{\"img_x\":610,\"img_y\":216,\"latitude\":31.584122501,\"longitude\":120.4174449755,\"world_x\":0,\"world_y\":0},{\"img_x\":610,\"img_y\":162,\"latitude\":31.5841197843,\"longitude\":120.4175585168,\"world_x\":0,\"world_y\":0},{\"img_x\":913,\"img_y\":472,\"latitude\":31.584096226,\"longitude\":120.4172050358,\"world_x\":0,\"world_y\":0},{\"img_x\":838,\"img_y\":330,\"latitude\":31.5840935102,\"longitude\":120.4172949135,\"world_x\":0,\"world_y\":0},{\"img_x\":791,\"img_y\":238,\"latitude\":31.5840898233,\"longitude\":120.4173990325,\"world_x\":0,\"world_y\":0},{\"img_x\":765,\"img_y\":190,\"latitude\":31.5840869945,\"longitude\":120.4174842862,\"world_x\":0,\"world_y\":0},{\"img_x\":765,\"img_y\":152,\"latitude\":31.584078742,\"longitude\":120.4175732653,\"world_x\":0,\"world_y\":0},{\"img_x\":1240,\"img_y\":451,\"latitude\":31.584059333,\"longitude\":120.4172043512,\"world_x\":0,\"world_y\":0},{\"img_x\":1125,\"img_y\":320,\"latitude\":31.584050415,\"longitude\":120.4172918722,\"world_x\":0,\"world_y\":0},{\"img_x\":1038,\"img_y\":229,\"latitude\":31.5840414598,\"longitude\":120.4173980212,\"world_x\":0,\"world_y\":0},{\"img_x\":982,\"img_y\":183,\"latitude\":31.5840363235,\"longitude\":120.4174822515,\"world_x\":0,\"world_y\":0},{\"img_x\":939,\"img_y\":150,\"latitude\":31.5840333532,\"longitude\":120.4175648133,\"world_x\":0,\"world_y\":0},{\"img_x\":1578,\"img_y\":416,\"latitude\":31.5840149942,\"longitude\":120.4172115553,\"world_x\":0,\"world_y\":0},{\"img_x\":1365,\"img_y\":307,\"latitude\":31.5840116898,\"longitude\":120.4172926657,\"world_x\":0,\"world_y\":0},{\"img_x\":1214,\"img_y\":227,\"latitude\":31.5840069315,\"longitude\":120.4173927222,\"world_x\":0,\"world_y\":0},{\"img_x\":1156,\"img_y\":191,\"latitude\":31.5840018943,\"longitude\":120.417455689,\"world_x\":0,\"world_y\":0},{\"img_x\":1087,\"img_y\":149,\"latitude\":31.5839940833,\"longitude\":120.4175576917,\"world_x\":0,\"world_y\":0},{\"img_x\":1907,\"img_y\":398,\"latitude\":31.583971154,\"longitude\":120.41721056,\"world_x\":0,\"world_y\":0},{\"img_x\":1665,\"img_y\":311,\"latitude\":31.5839686973,\"longitude\":120.4172779222,\"world_x\":0,\"world_y\":0},{\"img_x\":1453,\"img_y\":235,\"latitude\":31.5839656477,\"longitude\":120.4173690835,\"world_x\":0,\"world_y\":0},{\"img_x\":1379,\"img_y\":180,\"latitude\":31.583946084,\"longitude\":120.417462151,\"world_x\":0,\"world_y\":0},{\"img_x\":1256,\"img_y\":162,\"latitude\":31.583961164,\"longitude\":120.4175089342,\"world_x\":0,\"world_y\":0}]}"
module.exports = {
  testJson
}