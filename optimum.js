// Generert av optimize.js. Ikke rediger for hånd.
window.UTSTIGNING_OPTIMUM = {
  "generated": "2026-11-08",
  "lowerBound": 315.939520793332,
  "tested": 264,
  "coarseRuns": 30,
  "fineRuns": 200,
  "robustRuns": 40,
  "variants": [
    "Standard",
    "Halvparten klare ved landing",
    "Få tar ned bagasjen fra setet (30 %)",
    "Mange kofferter i annen rad (50 %)",
    "Mange trege (25 %)",
    "Mange utålmodige (25 %)",
    "Business i rad 1–4 går først"
  ],
  "fine": [
    {
      "name": "Bølger, bakre halvdel først; neste gruppe når 75 % av forrige er ute; fletter inn, 1 tom plass bak",
      "order": "Bølger, bakre halvdel først",
      "trigger": 0.75,
      "style": "fletter inn, 1 tom plass bak",
      "policy": {
        "groups": [
          "CD@16-30",
          "CD@1-15",
          "BE@16-30",
          "BE@1-15",
          "AF@16-30",
          "AF@1-15"
        ],
        "trigger": 0.75,
        "prep": true,
        "merge": 1
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 482.19500000004086,
        "p10": 434.8900000000304,
        "median": 478.1000000000402,
        "p90": 532.0200000000524,
        "min": 386.5000000000194,
        "max": 635.800000000076
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 475.70000000003967
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 483.7000000000415
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 548.2000000000561
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 520.0000000000497
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 534.8500000000531
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 482.1000000000411
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 494.10000000004385
        }
      ]
    },
    {
      "name": "Ditt forslag: tre bølger med innfletting",
      "order": "Tre bølger: midtgang, midt, vindu",
      "trigger": 1,
      "style": "fletter inn, 1 tom plass bak",
      "policy": {
        "groups": [
          "CD",
          "BE",
          "AF"
        ],
        "trigger": 1,
        "prep": true,
        "merge": 1
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 484.83150000004184,
        "p10": 434.3900000000303,
        "median": 480.55000000004077,
        "p90": 539.8900000000542,
        "min": 407.2000000000241,
        "max": 643.7000000000778
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 484.1500000000416
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 491.7000000000433
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 527.1500000000513
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 505.8500000000465
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 539.6500000000542
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 495.40000000004414
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 501.10000000004544
        }
      ]
    },
    {
      "name": "Seks kolonner, én side om gangen; neste gruppe når 75 % av forrige er ute; fletter inn, 1 tom plass bak",
      "order": "Seks kolonner, én side om gangen",
      "trigger": 0.75,
      "style": "fletter inn, 1 tom plass bak",
      "policy": {
        "groups": [
          "C",
          "D",
          "B",
          "E",
          "A",
          "F"
        ],
        "trigger": 0.75,
        "prep": true,
        "merge": 1
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 484.3110000000418,
        "p10": 441.30000000003184,
        "median": 482.30000000004117,
        "p90": 529.8500000000519,
        "min": 415.90000000002607,
        "max": 600.9000000000681
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 482.75000000004127
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 492.1500000000434
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 516.4500000000489
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 521.50000000005
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 539.100000000054
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 493.70000000004376
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 490.0000000000429
        }
      ]
    },
    {
      "name": "Bølger, oddetallsrader først; neste gruppe når 75 % av forrige er ute; fletter inn, 1 tom plass bak",
      "order": "Bølger, oddetallsrader først",
      "trigger": 0.75,
      "style": "fletter inn, 1 tom plass bak",
      "policy": {
        "groups": [
          "CD@odd",
          "CD@even",
          "BE@odd",
          "BE@even",
          "AF@odd",
          "AF@even"
        ],
        "trigger": 0.75,
        "prep": true,
        "merge": 1
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 485.67400000004193,
        "p10": 443.99000000003247,
        "median": 485.6000000000419,
        "p90": 530.7300000000521,
        "min": 409.9000000000247,
        "max": 599.2000000000677
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 480.05000000004065
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 492.6500000000435
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 518.1000000000492
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 515.6000000000487
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 537.7000000000537
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 486.4000000000421
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 491.95000000004336
        }
      ]
    },
    {
      "name": "Seks kolonner, én side om gangen; neste gruppe når 75 % av forrige er ute; fletter inn, 2 tomme plasser bak",
      "order": "Seks kolonner, én side om gangen",
      "trigger": 0.75,
      "style": "fletter inn, 2 tomme plasser bak",
      "policy": {
        "groups": [
          "C",
          "D",
          "B",
          "E",
          "A",
          "F"
        ],
        "trigger": 0.75,
        "prep": true,
        "merge": 2
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 490.0940000000428,
        "p10": 447.45000000003324,
        "median": 487.00000000004223,
        "p90": 538.1500000000538,
        "min": 409.5000000000246,
        "max": 578.9000000000631
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 486.25000000004206
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 494.55000000004395
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 519.9500000000496
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 530.6000000000521
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 538.2000000000538
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 492.6000000000435
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 504.3500000000462
        }
      ]
    },
    {
      "name": "Seks kolonner, én side om gangen; neste gruppe når forrige har forlatt setene; fletter inn, 1 tom plass bak",
      "order": "Seks kolonner, én side om gangen",
      "trigger": "entered",
      "style": "fletter inn, 1 tom plass bak",
      "policy": {
        "groups": [
          "C",
          "D",
          "B",
          "E",
          "A",
          "F"
        ],
        "trigger": "entered",
        "prep": true,
        "merge": 1
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 494.4825000000439,
        "p10": 453.19000000003456,
        "median": 491.7500000000433,
        "p90": 541.8600000000547,
        "min": 405.30000000002366,
        "max": 641.1000000000772
      }
    },
    {
      "name": "Bølger, oddetallsrader først; neste gruppe når forrige har forlatt setene; fletter inn, 1 tom plass bak",
      "order": "Bølger, oddetallsrader først",
      "trigger": "entered",
      "style": "fletter inn, 1 tom plass bak",
      "policy": {
        "groups": [
          "CD@odd",
          "CD@even",
          "BE@odd",
          "BE@even",
          "AF@odd",
          "AF@even"
        ],
        "trigger": "entered",
        "prep": true,
        "merge": 1
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 496.99650000004476,
        "p10": 452.6700000000344,
        "median": 493.8000000000438,
        "p90": 548.3600000000561,
        "min": 396.7000000000217,
        "max": 614.8000000000712
      }
    },
    {
      "name": "Tre bølger: midtgang, midt, vindu; neste gruppe når forrige er ute; fletter inn, 2 tomme plasser bak",
      "order": "Tre bølger: midtgang, midt, vindu",
      "trigger": 1,
      "style": "fletter inn, 2 tomme plasser bak",
      "policy": {
        "groups": [
          "CD",
          "BE",
          "AF"
        ],
        "trigger": 1,
        "prep": true,
        "merge": 2
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 496.86600000004466,
        "p10": 447.6800000000333,
        "median": 493.8500000000438,
        "p90": 547.720000000056,
        "min": 412.70000000002534,
        "max": 616.0000000000715
      }
    },
    {
      "name": "Seks kolonner, én side om gangen; neste gruppe når 75 % av forrige er ute; fletter inn, 3 tomme plasser bak",
      "order": "Seks kolonner, én side om gangen",
      "trigger": 0.75,
      "style": "fletter inn, 3 tomme plasser bak",
      "policy": {
        "groups": [
          "C",
          "D",
          "B",
          "E",
          "A",
          "F"
        ],
        "trigger": 0.75,
        "prep": true,
        "merge": 3
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 499.0185000000453,
        "p10": 454.1800000000348,
        "median": 495.7500000000442,
        "p90": 545.2000000000554,
        "min": 419.30000000002684,
        "max": 597.9000000000674
      }
    },
    {
      "name": "Seks kolonner, én side om gangen; neste gruppe når forrige er ute; fletter inn, 1 tom plass bak",
      "order": "Seks kolonner, én side om gangen",
      "trigger": 1,
      "style": "fletter inn, 1 tom plass bak",
      "policy": {
        "groups": [
          "C",
          "D",
          "B",
          "E",
          "A",
          "F"
        ],
        "trigger": 1,
        "prep": true,
        "merge": 1
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 499.02300000004453,
        "p10": 460.32000000003615,
        "median": 496.5000000000444,
        "p90": 540.2000000000543,
        "min": 418.7000000000267,
        "max": 577.9000000000628
      }
    },
    {
      "name": "Bølger, oddetallsrader først; neste gruppe når 75 % av forrige er ute; fletter inn, 3 tomme plasser bak",
      "order": "Bølger, oddetallsrader først",
      "trigger": 0.75,
      "style": "fletter inn, 3 tomme plasser bak",
      "policy": {
        "groups": [
          "CD@odd",
          "CD@even",
          "BE@odd",
          "BE@even",
          "AF@odd",
          "AF@even"
        ],
        "trigger": 0.75,
        "prep": true,
        "merge": 3
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 499.1220000000448,
        "p10": 454.3600000000348,
        "median": 498.6000000000449,
        "p90": 542.8100000000549,
        "min": 420.70000000002716,
        "max": 591.4000000000659
      }
    },
    {
      "name": "Seks kolonner, én side om gangen; neste gruppe når forrige har forlatt setene; fletter inn, 2 tomme plasser bak",
      "order": "Seks kolonner, én side om gangen",
      "trigger": "entered",
      "style": "fletter inn, 2 tomme plasser bak",
      "policy": {
        "groups": [
          "C",
          "D",
          "B",
          "E",
          "A",
          "F"
        ],
        "trigger": "entered",
        "prep": true,
        "merge": 2
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 499.9705000000452,
        "p10": 459.9900000000361,
        "median": 499.90000000004517,
        "p90": 543.490000000055,
        "min": 399.60000000002236,
        "max": 603.8000000000687
      }
    },
    {
      "name": "Vanlig praksis: alle går når de kan",
      "policy": {
        "kind": "fritt"
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 730.3255000000976,
        "p10": 660.7500000000817,
        "median": 729.5000000000973,
        "p90": 807.230000000115,
        "min": 599.4000000000677,
        "max": 872.0000000001297
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 740.3000000000998
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 761.4000000001046
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 838.300000000122
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 823.5500000001186
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 819.1500000001176
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 740.3000000000998
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 694.2500000000894
        }
      ]
    },
    {
      "name": "Høflig rad for rad",
      "policy": {
        "kind": "rad"
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 782.0420000001089,
        "p10": 715.130000000094,
        "median": 777.7000000001083,
        "p90": 858.3200000001266,
        "min": 664.7000000000826,
        "max": 926.000000000142
      }
    }
  ],
  "robust": [
    {
      "name": "Bølger, bakre halvdel først; neste gruppe når 75 % av forrige er ute; fletter inn, 1 tom plass bak",
      "order": "Bølger, bakre halvdel først",
      "trigger": 0.75,
      "style": "fletter inn, 1 tom plass bak",
      "policy": {
        "groups": [
          "CD@16-30",
          "CD@1-15",
          "BE@16-30",
          "BE@1-15",
          "AF@16-30",
          "AF@1-15"
        ],
        "trigger": 0.75,
        "prep": true,
        "merge": 1
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 482.19500000004086,
        "p10": 434.8900000000304,
        "median": 478.1000000000402,
        "p90": 532.0200000000524,
        "min": 386.5000000000194,
        "max": 635.800000000076
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 475.70000000003967
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 483.7000000000415
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 548.2000000000561
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 520.0000000000497
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 534.8500000000531
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 482.1000000000411
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 494.10000000004385
        }
      ]
    },
    {
      "name": "Ditt forslag: tre bølger med innfletting",
      "order": "Tre bølger: midtgang, midt, vindu",
      "trigger": 1,
      "style": "fletter inn, 1 tom plass bak",
      "policy": {
        "groups": [
          "CD",
          "BE",
          "AF"
        ],
        "trigger": 1,
        "prep": true,
        "merge": 1
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 484.83150000004184,
        "p10": 434.3900000000303,
        "median": 480.55000000004077,
        "p90": 539.8900000000542,
        "min": 407.2000000000241,
        "max": 643.7000000000778
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 484.1500000000416
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 491.7000000000433
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 527.1500000000513
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 505.8500000000465
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 539.6500000000542
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 495.40000000004414
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 501.10000000004544
        }
      ]
    },
    {
      "name": "Seks kolonner, én side om gangen; neste gruppe når 75 % av forrige er ute; fletter inn, 1 tom plass bak",
      "order": "Seks kolonner, én side om gangen",
      "trigger": 0.75,
      "style": "fletter inn, 1 tom plass bak",
      "policy": {
        "groups": [
          "C",
          "D",
          "B",
          "E",
          "A",
          "F"
        ],
        "trigger": 0.75,
        "prep": true,
        "merge": 1
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 484.3110000000418,
        "p10": 441.30000000003184,
        "median": 482.30000000004117,
        "p90": 529.8500000000519,
        "min": 415.90000000002607,
        "max": 600.9000000000681
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 482.75000000004127
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 492.1500000000434
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 516.4500000000489
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 521.50000000005
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 539.100000000054
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 493.70000000004376
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 490.0000000000429
        }
      ]
    },
    {
      "name": "Bølger, oddetallsrader først; neste gruppe når 75 % av forrige er ute; fletter inn, 1 tom plass bak",
      "order": "Bølger, oddetallsrader først",
      "trigger": 0.75,
      "style": "fletter inn, 1 tom plass bak",
      "policy": {
        "groups": [
          "CD@odd",
          "CD@even",
          "BE@odd",
          "BE@even",
          "AF@odd",
          "AF@even"
        ],
        "trigger": 0.75,
        "prep": true,
        "merge": 1
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 485.67400000004193,
        "p10": 443.99000000003247,
        "median": 485.6000000000419,
        "p90": 530.7300000000521,
        "min": 409.9000000000247,
        "max": 599.2000000000677
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 480.05000000004065
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 492.6500000000435
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 518.1000000000492
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 515.6000000000487
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 537.7000000000537
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 486.4000000000421
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 491.95000000004336
        }
      ]
    },
    {
      "name": "Seks kolonner, én side om gangen; neste gruppe når 75 % av forrige er ute; fletter inn, 2 tomme plasser bak",
      "order": "Seks kolonner, én side om gangen",
      "trigger": 0.75,
      "style": "fletter inn, 2 tomme plasser bak",
      "policy": {
        "groups": [
          "C",
          "D",
          "B",
          "E",
          "A",
          "F"
        ],
        "trigger": 0.75,
        "prep": true,
        "merge": 2
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 490.0940000000428,
        "p10": 447.45000000003324,
        "median": 487.00000000004223,
        "p90": 538.1500000000538,
        "min": 409.5000000000246,
        "max": 578.9000000000631
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 486.25000000004206
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 494.55000000004395
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 519.9500000000496
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 530.6000000000521
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 538.2000000000538
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 492.6000000000435
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 504.3500000000462
        }
      ]
    },
    {
      "name": "Vanlig praksis: alle går når de kan",
      "policy": {
        "kind": "fritt"
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 730.3255000000976,
        "p10": 660.7500000000817,
        "median": 729.5000000000973,
        "p90": 807.230000000115,
        "min": 599.4000000000677,
        "max": 872.0000000001297
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 740.3000000000998
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 761.4000000001046
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 838.300000000122
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 823.5500000001186
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 819.1500000001176
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 740.3000000000998
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 694.2500000000894
        }
      ]
    }
  ],
  "behavior": [
    {
      "name": "Slik folk gjør i dag (standard)",
      "forslag": 490.15000000004295,
      "vanlig": 733.0500000000982
    },
    {
      "name": "Alle tar ned bagasjen ved setet mens de venter",
      "forslag": 434.25000000003024,
      "vanlig": 608.6500000000699
    },
    {
      "name": "… og alle har bagasjen over egen rad",
      "forslag": 362.65000000001396,
      "vanlig": 480.50000000004076
    },
    {
      "name": "… og ingen er trege",
      "forslag": 341.7500000000092,
      "vanlig": 438.3500000000312
    }
  ]
};
