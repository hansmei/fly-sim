// Generert av optimize.js. Ikke rediger for hånd.
window.UTSTIGNING_OPTIMUM = {
  "generated": "2026-11-10",
  "lowerBound": 315.939520793332,
  "tested": 317,
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
      "name": "Bølger, bakre halvdel først; neste gruppe når forrige er ute; fletter inn, 1 tom plass bak",
      "order": "Bølger, bakre halvdel først",
      "trigger": 1,
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
        "trigger": 1,
        "prep": true,
        "merge": 1,
        "freeGo": true
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 472.56700000003866,
        "p10": 431.13000000002955,
        "median": 470.2500000000384,
        "p90": 515.9200000000487,
        "min": 394.30000000002116,
        "max": 606.0000000000692
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 471.0500000000386
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 479.15000000004045
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 549.4000000000564
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 521.7000000000501
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 520.9500000000498
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 485.2000000000418
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 495.2500000000441
        }
      ]
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
        "merge": 1,
        "freeGo": true
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 474.59950000003926,
        "p10": 435.7300000000306,
        "median": 474.4500000000394,
        "p90": 516.810000000049,
        "min": 394.1000000000211,
        "max": 578.500000000063
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 464.7500000000372
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 474.1000000000393
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 498.50000000004485
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 499.9500000000452
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 526.4500000000512
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 489.0500000000427
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 493.25000000004366
        }
      ]
    },
    {
      "name": "Bølger, oddetallsrader først; neste gruppe når forrige er ute; fletter inn, 1 tom plass bak",
      "order": "Bølger, oddetallsrader først",
      "trigger": 1,
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
        "trigger": 1,
        "prep": true,
        "merge": 1,
        "freeGo": true
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 475.0960000000394,
        "p10": 435.65000000003056,
        "median": 474.9000000000395,
        "p90": 515.0700000000486,
        "min": 395.9000000000215,
        "max": 572.5000000000616
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 474.1500000000393
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 478.30000000004026
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 505.3500000000464
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 503.40000000004596
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 524.8000000000508
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 483.50000000004144
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 490.15000000004295
        }
      ]
    },
    {
      "name": "Bølger, bakre halvdel først; neste gruppe når forrige er ute; fletter inn, 2 tomme plasser bak",
      "order": "Bølger, bakre halvdel først",
      "trigger": 1,
      "style": "fletter inn, 2 tomme plasser bak",
      "policy": {
        "groups": [
          "CD@16-30",
          "CD@1-15",
          "BE@16-30",
          "BE@1-15",
          "AF@16-30",
          "AF@1-15"
        ],
        "trigger": 1,
        "prep": true,
        "merge": 2,
        "freeGo": true
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 478.4915000000399,
        "p10": 438.59000000003124,
        "median": 475.65000000003965,
        "p90": 523.3300000000504,
        "min": 405.30000000002366,
        "max": 609.1000000000699
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 466.85000000003765
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 489.80000000004287
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 536.7500000000534
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 528.1000000000515
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 520.7000000000498
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 492.9500000000436
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 501.8500000000456
        }
      ]
    },
    {
      "name": "Bølger, oddetallsrader først; neste gruppe når forrige er ute; fletter inn, 2 tomme plasser bak",
      "order": "Bølger, oddetallsrader først",
      "trigger": 1,
      "style": "fletter inn, 2 tomme plasser bak",
      "policy": {
        "groups": [
          "CD@odd",
          "CD@even",
          "BE@odd",
          "BE@even",
          "AF@odd",
          "AF@even"
        ],
        "trigger": 1,
        "prep": true,
        "merge": 2,
        "freeGo": true
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 479.9355000000407,
        "p10": 441.47000000003186,
        "median": 477.9500000000402,
        "p90": 522.9600000000504,
        "min": 410.0000000000247,
        "max": 566.9000000000603
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 472.60000000003896
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 486.70000000004217
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 508.65000000004716
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 502.45000000004575
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 537.4000000000536
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 497.5000000000446
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 492.4500000000435
        }
      ]
    },
    {
      "name": "Seks kolonner, én side om gangen; neste gruppe når forrige er ute; fletter inn, 2 tomme plasser bak",
      "order": "Seks kolonner, én side om gangen",
      "trigger": 1,
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
        "trigger": 1,
        "prep": true,
        "merge": 2,
        "freeGo": true
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 480.8960000000409,
        "p10": 444.57000000003256,
        "median": 480.6500000000408,
        "p90": 517.130000000049,
        "min": 408.1000000000243,
        "max": 585.0000000000645
      }
    },
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
        "merge": 1,
        "freeGo": true
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 482.47100000004116,
        "p10": 433.7200000000301,
        "median": 481.80000000004105,
        "p90": 533.3200000000527,
        "min": 374.40000000001663,
        "max": 641.0000000000772
      }
    },
    {
      "name": "Seks kolonner, én side om gangen; neste gruppe når forrige er ute; fletter inn, 3 tomme plasser bak",
      "order": "Seks kolonner, én side om gangen",
      "trigger": 1,
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
        "trigger": 1,
        "prep": true,
        "merge": 3,
        "freeGo": true
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 485.6025000000419,
        "p10": 449.3900000000337,
        "median": 482.8500000000413,
        "p90": 525.0300000000508,
        "min": 408.70000000002443,
        "max": 580.6000000000635
      }
    },
    {
      "name": "Bølger, bakre halvdel først; neste gruppe når forrige er ute; fletter inn, 3 tomme plasser bak",
      "order": "Bølger, bakre halvdel først",
      "trigger": 1,
      "style": "fletter inn, 3 tomme plasser bak",
      "policy": {
        "groups": [
          "CD@16-30",
          "CD@1-15",
          "BE@16-30",
          "BE@1-15",
          "AF@16-30",
          "AF@1-15"
        ],
        "trigger": 1,
        "prep": true,
        "merge": 3,
        "freeGo": true
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 487.2785000000419,
        "p10": 447.1400000000332,
        "median": 485.0500000000418,
        "p90": 530.650000000052,
        "min": 414.8000000000258,
        "max": 635.800000000076
      }
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
        "merge": 1,
        "freeGo": true
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 485.96450000004154,
        "p10": 442.19000000003206,
        "median": 485.35000000004186,
        "p90": 534.610000000053,
        "min": 398.100000000022,
        "max": 589.4000000000655
      }
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
        "merge": 1,
        "freeGo": true
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 488.4130000000426,
        "p10": 436.9800000000309,
        "median": 486.55000000004213,
        "p90": 545.0100000000554,
        "min": 404.1000000000234,
        "max": 616.7000000000717
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 488.1000000000425
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 495.45000000004416
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 530.2500000000521
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 526.3500000000511
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 546.6000000000557
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 496.30000000004435
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 496.35000000004436
        }
      ]
    },
    {
      "name": "Bølger, oddetallsrader først; neste gruppe når forrige er ute; fletter inn, 3 tomme plasser bak",
      "order": "Bølger, oddetallsrader først",
      "trigger": 1,
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
        "trigger": 1,
        "prep": true,
        "merge": 3,
        "freeGo": true
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 487.4595000000419,
        "p10": 447.45000000003324,
        "median": 487.05000000004225,
        "p90": 531.6300000000523,
        "min": 409.8000000000247,
        "max": 567.8000000000605
      }
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
        "merge": 2,
        "freeGo": true
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 491.6780000000433,
        "p10": 452.5400000000344,
        "median": 490.60000000004305,
        "p90": 530.090000000052,
        "min": 416.0000000000261,
        "max": 586.6000000000648
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
        "kind": "rad",
        "freeGo": true
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 733.901000000098,
        "p10": 665.5600000000828,
        "median": 733.1000000000981,
        "p90": 813.6700000001165,
        "min": 582.0000000000638,
        "max": 905.1000000001372
      }
    }
  ],
  "robust": [
    {
      "name": "Bølger, bakre halvdel først; neste gruppe når forrige er ute; fletter inn, 1 tom plass bak",
      "order": "Bølger, bakre halvdel først",
      "trigger": 1,
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
        "trigger": 1,
        "prep": true,
        "merge": 1,
        "freeGo": true
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 472.56700000003866,
        "p10": 431.13000000002955,
        "median": 470.2500000000384,
        "p90": 515.9200000000487,
        "min": 394.30000000002116,
        "max": 606.0000000000692
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 471.0500000000386
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 479.15000000004045
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 549.4000000000564
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 521.7000000000501
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 520.9500000000498
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 485.2000000000418
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 495.2500000000441
        }
      ]
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
        "merge": 1,
        "freeGo": true
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 474.59950000003926,
        "p10": 435.7300000000306,
        "median": 474.4500000000394,
        "p90": 516.810000000049,
        "min": 394.1000000000211,
        "max": 578.500000000063
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 464.7500000000372
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 474.1000000000393
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 498.50000000004485
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 499.9500000000452
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 526.4500000000512
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 489.0500000000427
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 493.25000000004366
        }
      ]
    },
    {
      "name": "Bølger, oddetallsrader først; neste gruppe når forrige er ute; fletter inn, 1 tom plass bak",
      "order": "Bølger, oddetallsrader først",
      "trigger": 1,
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
        "trigger": 1,
        "prep": true,
        "merge": 1,
        "freeGo": true
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 475.0960000000394,
        "p10": 435.65000000003056,
        "median": 474.9000000000395,
        "p90": 515.0700000000486,
        "min": 395.9000000000215,
        "max": 572.5000000000616
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 474.1500000000393
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 478.30000000004026
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 505.3500000000464
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 503.40000000004596
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 524.8000000000508
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 483.50000000004144
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 490.15000000004295
        }
      ]
    },
    {
      "name": "Bølger, bakre halvdel først; neste gruppe når forrige er ute; fletter inn, 2 tomme plasser bak",
      "order": "Bølger, bakre halvdel først",
      "trigger": 1,
      "style": "fletter inn, 2 tomme plasser bak",
      "policy": {
        "groups": [
          "CD@16-30",
          "CD@1-15",
          "BE@16-30",
          "BE@1-15",
          "AF@16-30",
          "AF@1-15"
        ],
        "trigger": 1,
        "prep": true,
        "merge": 2,
        "freeGo": true
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 478.4915000000399,
        "p10": 438.59000000003124,
        "median": 475.65000000003965,
        "p90": 523.3300000000504,
        "min": 405.30000000002366,
        "max": 609.1000000000699
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 466.85000000003765
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 489.80000000004287
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 536.7500000000534
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 528.1000000000515
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 520.7000000000498
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 492.9500000000436
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 501.8500000000456
        }
      ]
    },
    {
      "name": "Bølger, oddetallsrader først; neste gruppe når forrige er ute; fletter inn, 2 tomme plasser bak",
      "order": "Bølger, oddetallsrader først",
      "trigger": 1,
      "style": "fletter inn, 2 tomme plasser bak",
      "policy": {
        "groups": [
          "CD@odd",
          "CD@even",
          "BE@odd",
          "BE@even",
          "AF@odd",
          "AF@even"
        ],
        "trigger": 1,
        "prep": true,
        "merge": 2,
        "freeGo": true
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 479.9355000000407,
        "p10": 441.47000000003186,
        "median": 477.9500000000402,
        "p90": 522.9600000000504,
        "min": 410.0000000000247,
        "max": 566.9000000000603
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 472.60000000003896
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 486.70000000004217
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 508.65000000004716
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 502.45000000004575
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 537.4000000000536
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 497.5000000000446
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 492.4500000000435
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
        "merge": 1,
        "freeGo": true
      },
      "fine": {
        "id": "x",
        "runs": 200,
        "mean": 488.4130000000426,
        "p10": 436.9800000000309,
        "median": 486.55000000004213,
        "p90": 545.0100000000554,
        "min": 404.1000000000234,
        "max": 616.7000000000717
      },
      "robust": [
        {
          "variant": "Standard",
          "median": 488.1000000000425
        },
        {
          "variant": "Halvparten klare ved landing",
          "median": 495.45000000004416
        },
        {
          "variant": "Få tar ned bagasjen fra setet (30 %)",
          "median": 530.2500000000521
        },
        {
          "variant": "Mange kofferter i annen rad (50 %)",
          "median": 526.3500000000511
        },
        {
          "variant": "Mange trege (25 %)",
          "median": 546.6000000000557
        },
        {
          "variant": "Mange utålmodige (25 %)",
          "median": 496.30000000004435
        },
        {
          "variant": "Business i rad 1–4 går først",
          "median": 496.35000000004436
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
      "forslag": 492.30000000004344,
      "vanlig": 733.0500000000982
    },
    {
      "name": "Alle tar ned bagasjen ved setet mens de venter",
      "forslag": 430.35000000002935,
      "vanlig": 608.6500000000699
    },
    {
      "name": "… og alle har bagasjen over egen rad",
      "forslag": 362.95000000001403,
      "vanlig": 480.50000000004076
    },
    {
      "name": "… og ingen er trege",
      "forslag": 341.7500000000092,
      "vanlig": 438.3500000000312
    }
  ]
};
