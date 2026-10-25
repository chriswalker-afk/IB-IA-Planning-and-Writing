/** Curated task guides. Source pages checked 15 October 2026; videos are publisher-listed,
 * not represented as fully watched or teacher-approved. No embedded third-party content.
 */
export const TOOLS = {
  "sheets": {
    "name": "Google Sheets",
    "url": "https://sheets.google.com",
    "device": "Best on a computer; sign-in needed to create/save sheets."
  },
  "desmos": {
    "name": "Desmos",
    "url": "https://www.desmos.com/calculator",
    "device": "Browser tool; a computer is easier for tables and pictures. Account saving may need sign-in."
  },
  "forms": {
    "name": "Google Forms",
    "url": "https://forms.google.com",
    "device": "Best on a computer; sign-in and school permissions may apply."
  },
  "databank": {
    "name": "World Bank DataBank",
    "url": "https://databank.worldbank.org",
    "device": "Best on a computer. Check source definitions before use."
  },
  "webplotdigitizer": {
    "name": "WebPlotDigitizer",
    "url": "https://automeris.io",
    "device": "Best on a computer; check the current product/access options."
  },
  "docs": {"name":"Google Docs","url":"https://docs.google.com/document/","device":"Use a computer for Tools > Citations; the built-in citation sidebar is not available in mobile apps."},
  "general": {
    "name": "Choose a tool",
    "url": "",
    "device": "Use the written guide with the tool appropriate to your task."
  }
};

export const RESOURCES = [
{
  "id": "mla-citations",
  "title": "Cite your sources with MLA in Google Docs",
  "category": "Writing and checking",
  "tool": "docs",
  "when": "When your Maths IA uses published data, an external mathematical method, someone else's image or borrowed words or ideas.",
  "steps": [
    "On a computer, open your IA in Google Docs. Select Tools > Citations and choose MLA (8th ed.), the MLA option offered by Google Docs.",
    "Select + Add citation source. Choose the correct source type and how you accessed it, then fill in available author or organisation, title, publisher, date and URL details.",
    "Place your cursor after the relevant borrowed idea, dataset or method. In the Citations sidebar, hover over the source and select Cite. Replace any # placeholder with a real page number, or remove it when no page number applies.",
    "At the end of your actual IA, use Insert bibliography to create the list, and label it Works Cited.",
    "Review each in-text citation against the actual source and Works Cited. Remove entries you never cited and recreate the bibliography after editing sources."
  ],
  "check": "Can the reader find the original source for each borrowed dataset, image, technique or quotation, using the citation and Works Cited entry? Do not assume Google Docs verifies details automatically.",
  "after": "Add sources at the point of use in Google Docs, rather than leaving them to the final review. Source credit is required for academic integrity, not a separate assessed criterion.",
  "sources": [
    {
      "publisher": "Google Docs Editors Help",
      "url": "https://support.google.com/docs/answer/10090962?hl=en",
      "title": "Add citations and a bibliography",
      "checkedAt": "2026-10-23",
      "verification": "Google's official instructions"
    },
    {
      "publisher": "MLA Style Center",
      "url": "https://style.mla.org/",
      "title": "Official MLA Style Center",
      "checkedAt": "2026-10-23",
      "verification": "Original MLA guidance"
    },
    {
      "publisher": "International Baccalaureate",
      "url": "https://www.ibo.org/programmes/diploma-programme/assessment-and-exams/academic-integrity/",
      "title": "Academic integrity",
      "checkedAt": "2026-10-23",
      "verification": "IB guidance"
    },
    {
      "publisher": "World Bank Open Data",
      "url": "https://data.worldbank.org/indicator/SP.POP.TOTL",
      "title": "Population, total: worked citation example",
      "checkedAt": "2026-10-23",
      "verification": "Real data page; demonstration only"
    }
  ],
  "videos": [],
  "snippets": [],
  "related": []
},
  {
    "id": "organise",
    "title": "Organise data without losing the pairs",
    "category": "Data and graphs",
    "tool": "sheets",
    "when": "Before making a graph or calculating a statistic from collected or sourced observations.",
    "steps": [
      "Keep the original data unchanged. Make a clearly named working copy and record the original source, dates and definitions.",
      "Use one row per observation. Label columns with the actual quantity and unit, and keep an anonymous observation ID when needed.",
      "For paired data, keep the two values on the same row. Filter, sort or remove whole records together, never just one variable.",
      "Identify missing values and check questionable entries against the source. Document decisions; do not silently fill gaps or treat missing values as zeros."
    ],
    "check": "Select a row and explain exactly what it represents. Check that numerical values are recognised as numbers.",
    "after": "Record your actual source, any cleaning decisions and the consequences for what the data can support. A prepared table is not yet an analysis.",
    "sources": [
      {
        "publisher": "Dataspire",
        "url": "https://www.dataspire.org/data-bites",
        "title": "Data Bites: data organisation and visualisation",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [
      {
        "url": "https://www.dataspire.org/data-bites",
        "publisher": "Dataspire",
        "find": "Organize Data to Explore/Graph It",
        "duration": "",
        "note": "Published in 2022; interface details may differ.",
        "status": "publisher-listed",
        "watchedInFull": false,
        "captions": "Not verified; written steps are available here",
        "checkedAt": "2026-10-15"
      }
    ],
    "snippets": [],
    "related": [
      "sheets-scatter",
      "chart-choice"
    ]
  },
  {
    "id": "chart-choice",
    "title": "Choose a graph for the question",
    "category": "Data and graphs",
    "tool": "general",
    "when": "When deciding on a first representation, before accepting a software default.",
    "steps": [
      "Identify what you need to see: association, distribution, a comparison of groups, or change over time.",
      "A scatter plot can show association between paired numerical observations. A histogram or box plot can show a numerical distribution; bars can compare categories.",
      "Check what the horizontal position means. Connecting points is meaningful only when their order or a continuous relationship warrants it.",
      "Choose one representation, name the quantities and units, and state what it might reveal before making it."
    ],
    "check": "Could this graph answer your stated question? A labelled mathematical diagram or small case may be better than a statistical chart.",
    "after": "After producing it, describe the actual pattern and its meaning for your aim. Do not claim a coefficient or fitted equation you have not calculated.",
    "sources": [
      {
        "publisher": "Dataspire",
        "url": "https://www.dataspire.org/data-bites",
        "title": "Data Bites: data organisation and visualisation",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      },
      {
        "publisher": "Runestone Academy",
        "url": "https://runestone.academy/ns/books/published/ac1/scatter_plots_and_correlation/creating_a_scatter_plot_in_sheets.html",
        "title": "Creating a scatter plot in Sheets",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [
      {
        "url": "https://www.dataspire.org/data-bites",
        "publisher": "Dataspire",
        "find": "Create Data Visualizations in Google Sheets",
        "duration": "",
        "note": "A collection of graph types, not a recommendation to use all of them; published in 2022.",
        "status": "publisher-listed",
        "watchedInFull": false,
        "captions": "Not verified; written steps are available here",
        "checkedAt": "2026-10-15"
      }
    ],
    "snippets": [],
    "related": [
      "sheets-scatter",
      "distribution-graphs"
    ]
  },
  {
    "id": "sheets-scatter",
    "title": "Draw and label a scatter graph in Sheets",
    "category": "Data and graphs",
    "tool": "sheets",
    "when": "For two numerical variables recorded as matched observations.",
    "steps": [
      "In the working table, put your x-values in column A and corresponding y-values in column B, with headings and units in row 1.",
      "Select the intended table, choose Insert > Chart, and select Scatter chart in the chart editor.",
      "Check that the x-axis uses the intended variable and the series uses the other variable. Check the selected data range.",
      "Under Customise, edit chart and axis titles. Set a readable viewing range and keep the points visible without decorative clutter."
    ],
    "check": "Compare two plotted points with the original rows. Check for accidental row numbers on the x-axis.",
    "after": "Describe the shape and direction in context. Do not fit a line just because the menu offers one.",
    "sources": [
      {
        "publisher": "Runestone Academy",
        "url": "https://runestone.academy/ns/books/published/ac1/scatter_plots_and_correlation/creating_a_scatter_plot_in_sheets.html",
        "title": "Creating a scatter plot in Sheets",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [
      {
        "url": "https://www.dataspire.org/data-bites",
        "publisher": "Dataspire",
        "find": "Create Data Visualizations in Google Sheets: choose the scatter-plot section",
        "duration": "",
        "note": "Published in 2022; use the written guide for current controls.",
        "status": "publisher-listed",
        "watchedInFull": false,
        "captions": "Not verified; written steps are available here",
        "checkedAt": "2026-10-15"
      }
    ],
    "snippets": [],
    "related": [
      "sheets-pmcc",
      "desmos-table"
    ]
  },
  {
    "id": "sheets-pmcc",
    "title": "Calculate PMCC in Google Sheets",
    "category": "Correlation and models",
    "tool": "sheets",
    "when": "After deciding that Pearson's coefficient will help quantify linear association in paired numerical observations.",
    "steps": [
      "Inspect your scatter first. Confirm that every x-value is still matched to the correct y-value and both variables vary.",
      "Select only the intended paired numerical rows. Resolve missing values transparently; do not sort the columns independently.",
      "In a spare cell enter CORREL with the two ranges. For six practice pairs in rows 2 to 7, use the formula below.",
      "Check the output against the scatter, retain working precision and record your actual coefficient separately from any practice result."
    ],
    "check": "The value must lie between -1 and 1. A zero-variation variable makes correlation undefined; an error is not evidence of no relationship.",
    "after": "Interpret the sign and size as linear association in your sample, not causation. Link the meaning to your aim.",
    "sources": [
      {
        "publisher": "Google",
        "url": "https://support.google.com/docs/answer/3093990?hl=en",
        "title": "CORREL function",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      },
      {
        "publisher": "Runestone Academy",
        "url": "https://runestone.academy/ns/books/published/ac1/scatter_plots_and_correlation/correlation_and_college_data.html",
        "title": "CORREL video linked in the college-data example",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [
      {
        "url": "https://runestone.academy/ns/books/published/ac1/scatter_plots_and_correlation/correlation_and_college_data.html",
        "publisher": "Runestone Academy",
        "find": "Follow the CORREL video link in the example. Focus on entering the function, not searching for a preferred result.",
        "duration": "",
        "note": "",
        "status": "publisher-listed",
        "watchedInFull": false,
        "captions": "Not verified; written steps are available here",
        "checkedAt": "2026-10-15"
      }
    ],
    "snippets": [
      [
        "Example formula for six pairs",
        "=CORREL(A2:A7,B2:B7)"
      ]
    ],
    "related": [
      "pmcc-meaning",
      "desmos-pmcc"
    ],
    "practice": "paired"
  },
  {
    "id": "desmos-pmcc",
    "title": "Calculate PMCC in Desmos",
    "category": "Correlation and models",
    "tool": "desmos",
    "when": "After choosing Pearson's coefficient for paired numerical observations, without fitting a regression just to obtain it.",
    "steps": [
      "Enter the matched numerical observations in a Desmos table, with x-values in x_1 and y-values in y_1. Keep the intended pairs together.",
      "Inspect the scatter and check that both variables vary. Resolve missing observations transparently before calculating.",
      "In a blank expression enter corr(x_1,y_1). Use your actual table column names if they differ.",
      "Compare the sign and size of the output with the scatter and record the coefficient from your own data, not the practice table."
    ],
    "check": "Check the lists have the same observations in the same order. A line or curve fit is a different mathematical task.",
    "after": "Interpret linear association for your sample and aim. A small value does not rule out a nonlinear relationship and correlation alone is not causation.",
    "sources": [
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/212235786-Supported-Functions",
        "title": "Supported statistical and graphing functions",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      },
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/4405489674381-Tables",
        "title": "Tables",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [],
    "snippets": [
      [
        "Pearson coefficient from a table",
        "corr(x_1,y_1)"
      ]
    ],
    "related": [
      "pmcc-meaning",
      "sheets-pmcc"
    ],
    "practice": "paired"
  },
  {
    "id": "pmcc-meaning",
    "title": "Interpret your actual PMCC",
    "category": "Correlation and models",
    "tool": "general",
    "when": "After you have calculated Pearson's coefficient, using the scatter and sample that produced it.",
    "steps": [
      "Identify the direction from the sign and describe the degree of linear association in the context of your data. Avoid universal cut-off labels.",
      "Compare the coefficient with the scatter. Curvature, an influential observation or restricted range may affect its usefulness.",
      "Explain which part of your aim the association addresses. It does not establish a causal mechanism.",
      "Decide whether an unanswered prediction or model question really remains. Another technique is optional, not an automatic next step."
    ],
    "check": "A small coefficient is not evidence against every possible relationship; inspect for nonlinear patterns.",
    "after": "Write a local takeaway immediately after the statistic, referring to your actual value and quantities.",
    "sources": [
      {
        "publisher": "Google",
        "url": "https://support.google.com/docs/answer/3093990?hl=en",
        "title": "CORREL function",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      },
      {
        "publisher": "Runestone Academy",
        "url": "https://runestone.academy/ns/books/published/ac1/scatter_plots_and_correlation/correlation_and_college_data.html",
        "title": "CORREL video linked in the college-data example",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [],
    "snippets": [],
    "related": [
      "model-check"
    ]
  },
  {
    "id": "sheets-linear",
    "title": "Fit and use a straight-line model in Sheets",
    "category": "Correlation and models",
    "tool": "sheets",
    "when": "When a straight-line model is justified and estimation or prediction would serve the aim.",
    "steps": [
      "Create a scatter of the intended paired numerical data. Open the chart editor, then Customise > Series > Trendline, choosing Linear.",
      "Display the equation through the trendline label options. Show R-squared only if you will explain what it contributes.",
      "For predictions use SLOPE and INTERCEPT from the underlying data rather than coefficients rounded in a chart label.",
      "Check a prediction within the fitted range, with units. Inspect deviations between observations and predicted values."
    ],
    "check": "R-squared is not the signed PMCC. A good-looking line does not justify extrapolation or causation.",
    "after": "Explain the slope with its units and whether the intercept has a meaningful interpretation for your domain.",
    "sources": [
      {
        "publisher": "Google",
        "url": "https://support.google.com/docs/answer/6075154?hl=en-IE",
        "title": "Add and edit a trendline",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      },
      {
        "publisher": "Google",
        "url": "https://support.google.com/docs/answer/3093990?hl=en",
        "title": "CORREL function",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [],
    "snippets": [
      [
        "Slope (y in B, x in A)",
        "=SLOPE(B2:B7,A2:A7)"
      ],
      [
        "Intercept",
        "=INTERCEPT(B2:B7,A2:A7)"
      ]
    ],
    "related": [
      "model-check",
      "export-figure"
    ],
    "practice": "paired"
  },
  {
    "id": "desmos-start",
    "title": "Get started with Desmos graphs",
    "category": "Data and graphs",
    "tool": "desmos",
    "when": "For a first graphing task or a quick reminder of the controls.",
    "steps": [
      "Open the Graphing Calculator and enter a function or point in a blank expression line. Try the practice expression below.",
      "Pan or zoom to see the relevant domain; use Graph Settings to set the x- and y-ranges deliberately.",
      "Select a graph to examine displayed intercepts or intersections. Check significant coordinates in the original equation.",
      "Name your quantities in a note and keep an editable copy using the saving options. Account saving may require sign-in."
    ],
    "check": "Check angle mode for trigonometry and whether a numerical display is approximate.",
    "after": "Explain why this representation was useful, then what the actual graph establishes. A screen image alone is not an explanation.",
    "sources": [
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/4406040715149-Getting-Started-Desmos-Graphing-Calculator",
        "title": "Getting started",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [
      {
        "url": "https://help.desmos.com/hc/en-us/articles/4406040715149-Getting-Started-Desmos-Graphing-Calculator",
        "publisher": "Desmos",
        "find": "Introductory video near the top of the official guide",
        "duration": "",
        "note": "",
        "status": "publisher-listed",
        "watchedInFull": false,
        "captions": "Not verified; written steps are available here",
        "checkedAt": "2026-10-15"
      }
    ],
    "snippets": [
      [
        "Practice function",
        "f(x)=x^2-4"
      ]
    ],
    "related": [
      "desmos-table",
      "image-import"
    ]
  },
  {
    "id": "desmos-table",
    "title": "Move paired data from Sheets into Desmos",
    "category": "Data and graphs",
    "tool": "desmos",
    "when": "For plotting numerical coordinates already checked in a spreadsheet.",
    "steps": [
      "Select the two intended numerical columns together; keep a separate record of headings, units and source.",
      "Copy the values and paste into a blank Desmos expression line. Check the resulting x_1 and y_1 table.",
      "Use Zoom Fit to locate the points. Compare several table values with the spreadsheet.",
      "Keep the source observations fixed. Do not drag measured points to improve a fit."
    ],
    "check": "Column headings do not transfer automatically. More than 1000 rows may be split across tables; check that you have not analysed only part of your data.",
    "after": "Record what you plotted and its purpose. Decide on further mathematics from the observed pattern.",
    "sources": [
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/4405489674381-Tables",
        "title": "Tables",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [],
    "snippets": [],
    "related": [
      "desmos-regression"
    ],
    "practice": "paired"
  },
  {
    "id": "image-import",
    "title": "Import and position a picture in Desmos",
    "category": "Pictures and curves",
    "tool": "desmos",
    "when": "For an image-based mathematical investigation, using a picture you have permission to use.",
    "steps": [
      "Save a suitable image and its source details. Use the 2D Graphing Calculator, not the 3D tool.",
      "Choose Add Item (+) > Image, then select the file. Drag-and-drop into the expression list also works in many browsers.",
      "Set its centre, width, height and angle deliberately. Lower opacity to make your points or curve visible.",
      "Preserve the image proportions. Record the original dimensions and position before taking coordinates; calibrate before calling them real lengths."
    ],
    "check": "Do not include faces, names or confidential information in an external graph. An imported picture is not an automatically fitted model.",
    "after": "Cite the picture, justify the contour selected and explain the coordinate system before using measurements.",
    "sources": [
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/4407895086349-Add-an-Item-to-a-Graph",
        "title": "Add an image to a graph",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      },
      {
        "publisher": "University at Albany KNILT",
        "url": "https://knilt.arcc.albany.edu/Unit_3%3A_Building_Desmos_Activities",
        "title": "Image-import video in the graph-screen section",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=0L09yzY7S_0",
        "publisher": "University at Albany KNILT",
        "find": "Image-import demonstration",
        "duration": "",
        "note": "Older third-party demonstration linked by KNILT; activity-builder/interface details may differ.",
        "status": "publisher-listed",
        "watchedInFull": false,
        "captions": "Not verified; written steps are available here",
        "checkedAt": "2026-10-15"
      }
    ],
    "snippets": [],
    "related": [
      "image-scale"
    ]
  },
  {
    "id": "image-scale",
    "title": "Calibrate a picture before measuring it",
    "category": "Pictures and curves",
    "tool": "desmos",
    "when": "Before interpreting image coordinates as real lengths, areas or volumes.",
    "steps": [
      "Choose an origin and axes appropriate for the shape. Identify a known length in the same plane as the contour.",
      "Measure its length in graph coordinates. Divide the known physical length by the coordinate length to obtain a scale factor.",
      "Keep horizontal and vertical scaling consistent. Do not stretch one direction to make your curve look better.",
      "Record the calibration, reference-length uncertainty, image resolution and possible perspective effects. Recheck after repositioning or resizing."
    ],
    "check": "For a known 20 cm span covering 4 coordinate units, the scale is 5 cm per unit. Areas then scale by 25, not 5. Without calibration, use coordinate units.",
    "after": "Explain which claims the image can support. A single calibration cannot remove perspective or lens distortion.",
    "sources": [
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/4407895086349-Add-an-Item-to-a-Graph",
        "title": "Add an image to a graph",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [],
    "snippets": [],
    "related": [
      "image-route"
    ]
  },
  {
    "id": "image-route",
    "title": "Visual fitting or coordinate regression?",
    "category": "Pictures and curves",
    "tool": "desmos",
    "when": "Before claiming how you determined a curve from a picture.",
    "steps": [
      "For a visual model, choose a function family for a mathematical reason and adjust parameters while examining the contour.",
      "For coordinate regression, first record approximate coordinates across the relevant contour. Fit your chosen model to those points.",
      "Name the approach honestly. Desmos regression fits supplied numbers, not the pixels of the picture.",
      "With either approach, restrict the domain and check where the model misses the shape before using it in another calculation."
    ],
    "check": "A curve adjusted by eye is not automatically a least-squares regression. More complicated functions are not automatically better models.",
    "after": "State the method and its limitations beside the model, and justify what calculation using it would answer your aim.",
    "sources": [
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/4407895086349-Add-an-Item-to-a-Graph",
        "title": "Add an image to a graph",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      },
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/4406972958733-Regressions",
        "title": "Regressions and residuals",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [],
    "snippets": [],
    "related": [
      "image-visual",
      "image-points"
    ]
  },
  {
    "id": "image-visual",
    "title": "Adjust a curve to a picture with sliders",
    "category": "Pictures and curves",
    "tool": "desmos",
    "when": "For deliberate visual modelling, not a claim of statistical regression.",
    "steps": [
      "Calibrate the image first. Choose a function family whose mathematical features might explain the contour.",
      "Enter the practice quadratic below only to explore slider controls; choose your own family for your own contour.",
      "Add sliders for the parameters and change one at a time. Explain what each change does to the shape.",
      "Record the parameter choices and a justified interval. Check multiple parts of the contour rather than matching just one point."
    ],
    "check": "Describe the fit as visual unless you actually fitted recorded numerical coordinates. Do not change image proportions to hide a poor fit.",
    "after": "Explain why the family and parameters are plausible and where the approximation affects the result.",
    "sources": [
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/202529069-Sliders-and-Movable-Points-in-a-Graph",
        "title": "Sliders and movable points",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      },
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/4407895086349-Add-an-Item-to-a-Graph",
        "title": "Add an image to a graph",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [
      {
        "url": "https://help.desmos.com/hc/en-us/articles/202529069-Sliders-and-Movable-Points-in-a-Graph",
        "publisher": "Desmos",
        "find": "Official slider introduction; use it with the image-import written guide",
        "duration": "",
        "note": "",
        "status": "publisher-listed",
        "watchedInFull": false,
        "captions": "Not verified; written steps are available here",
        "checkedAt": "2026-10-15"
      }
    ],
    "snippets": [
      [
        "Practice slider model",
        "y=a(x-h)^2+k"
      ]
    ],
    "related": [
      "restrictions",
      "model-check"
    ]
  },
  {
    "id": "image-points",
    "title": "Record coordinates from a picture",
    "category": "Pictures and curves",
    "tool": "desmos",
    "when": "When you have chosen coordinate regression and established the image scale.",
    "steps": [
      "Choose the exact contour being modelled. Preserve a fixed calibrated image with its source.",
      "Sample coordinate pairs across the relevant interval, including regions that reveal changes in shape. Record your point-selection rule.",
      "Enter the approximate pairs into a table; keep points distinguishable from the original contour. Avoid claiming more precision than the image permits.",
      "Keep the image and point table visible when checking the fitted curve. Additional independently selected check points can reveal local mismatch."
    ],
    "check": "Dense sampling in just one region can dominate a least-squares fit. Sampled image points are approximate, not new exact measurements.",
    "after": "Explain point selection, calibration and why the fitted model is useful; then record the actual regression output.",
    "sources": [
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/4405489674381-Tables",
        "title": "Tables",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      },
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/4407895086349-Add-an-Item-to-a-Graph",
        "title": "Add an image to a graph",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [],
    "snippets": [],
    "related": [
      "desmos-regression"
    ]
  },
  {
    "id": "desmos-regression",
    "title": "Fit a chosen curve to numerical coordinates",
    "category": "Correlation and models",
    "tool": "desmos",
    "when": "After choosing a plausible model and supplying real data or clearly labelled mathematical/practice coordinates.",
    "steps": [
      "Put the intended numerical pairs into a Desmos table. Keep the observation points fixed.",
      "Use a regression template, or enter a custom model with the table variables and a tilde instead of equals.",
      "Read and record the fitted parameter values. Define the fitted function separately when you need predictions.",
      "Check its domain, residuals and behaviour. Do not choose a high-degree polynomial solely to raise a fit statistic."
    ],
    "check": "The example below illustrates syntax, not a recommendation that your investigation needs a quadratic.",
    "after": "Interpret relevant parameters and explain what this model can answer. A mathematical or graphical fit is not proof of causation.",
    "sources": [
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/4406972958733-Regressions",
        "title": "Regressions and residuals",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [
      {
        "url": "https://help.desmos.com/hc/en-us/articles/4406972958733-Regressions",
        "publisher": "Desmos",
        "find": "Official regression video near the top of the guide",
        "duration": "",
        "note": "",
        "status": "publisher-listed",
        "watchedInFull": false,
        "captions": "Not verified; written steps are available here",
        "checkedAt": "2026-10-15"
      }
    ],
    "snippets": [
      [
        "Example custom regression",
        "y_1~a x_1^2+b x_1+c"
      ]
    ],
    "related": [
      "model-check",
      "restrictions"
    ]
  },
  {
    "id": "model-check",
    "title": "Check a fitted model with residuals",
    "category": "Correlation and models",
    "tool": "general",
    "when": "After fitting a model, before relying on its predictions or derived quantities.",
    "steps": [
      "A residual is observed minus predicted y for a particular x. Calculate it for each intended observation.",
      "In a Desmos regression, open the residuals options and choose Plot. In Sheets, calculate a predicted-y column and subtract it from observed y, then scatter the residuals against x.",
      "Look for systematic structure, changing spread and influential points. Check the original data rather than deleting inconvenient observations.",
      "Check predictions against the context and fitted range. Compare an alternative only when a real mathematical question motivates it."
    ],
    "check": "Residual patterns prompt investigation; they do not prove a particular alternative model. A high R-squared does not validate every use of the model.",
    "after": "Discuss consequential mismatch beside the fit. State whether the model answers the aim or which specific question follows.",
    "sources": [
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/4406972958733-Regressions",
        "title": "Regressions and residuals",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      },
      {
        "publisher": "Google",
        "url": "https://support.google.com/docs/answer/6075154?hl=en-IE",
        "title": "Add and edit a trendline",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [
      {
        "url": "https://help.desmos.com/hc/en-us/articles/4406972958733-Regressions",
        "publisher": "Desmos",
        "find": "Official regression guide: residual Plot controls",
        "duration": "",
        "note": "",
        "status": "publisher-listed",
        "watchedInFull": false,
        "captions": "Not verified; written steps are available here",
        "checkedAt": "2026-10-15"
      }
    ],
    "snippets": [
      [
        "Sheets residual if B is observed y and C is predicted y",
        "=B2-C2"
      ]
    ],
    "related": [
      "export-figure"
    ]
  },
  {
    "id": "restrictions",
    "title": "Restrict a curve to a justified domain",
    "category": "Pictures and curves",
    "tool": "desmos",
    "when": "When only part of a curve represents the object or conditions being investigated.",
    "steps": [
      "Decide the domain from the actual object, data range or assumptions; do not choose it just to hide inconvenient values.",
      "In Desmos append a condition in curly braces to the expression, using the relevant variable.",
      "Check both endpoints and any joins between sections. A piecewise model needs a reason for each part.",
      "Retain the domain when interpreting parameters, calculating areas or making predictions."
    ],
    "check": "A displayed restriction controls the plotted segment. It does not validate the model outside it or justify discontinuities.",
    "after": "Explain the interval with its units and why these are the conditions where your mathematical statement applies.",
    "sources": [
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/4407885334285-Inequalities-and-Restrictions",
        "title": "Inequalities and restrictions",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [
      {
        "url": "https://help.desmos.com/hc/en-us/articles/4407885334285-Inequalities-and-Restrictions",
        "publisher": "Desmos",
        "find": "Use the Restrictions video, not just the first Inequalities video",
        "duration": "",
        "note": "",
        "status": "publisher-listed",
        "watchedInFull": false,
        "captions": "Not verified; written steps are available here",
        "checkedAt": "2026-10-15"
      }
    ],
    "snippets": [
      [
        "Practice restricted curve",
        "y=x^2 {0<=x<=3}"
      ]
    ],
    "related": [
      "export-figure"
    ]
  },
  {
    "id": "export-figure",
    "title": "Save the graph and prepare an IA figure",
    "category": "Writing and access",
    "tool": "general",
    "when": "After producing a graph or while reviewing the presentation of your actual work.",
    "steps": [
      "Retain an editable copy in your graphing tool. Desmos account saving may require sign-in; Sheets saves to the account you use.",
      "Set a readable window, labels and units. Show the relevant mathematical features, not the whole software desktop.",
      "Use the tool's image-export or download options. In Desmos these are in Share Graph; check the resulting image before inserting it.",
      "Add a figure reference, source acknowledgement and your own nearby interpretation. Inspect the final document at normal reading size."
    ],
    "check": "A shared graph or spreadsheet link may expose its data. Remove confidential details and check access before sharing.",
    "after": "Refer to what the figure establishes for the aim. Keep the graph file as well as the image so you can revise it.",
    "sources": [
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/4405901719309-Saving-and-Sharing-Your-Work",
        "title": "Saving and sharing your work",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      },
      {
        "publisher": "Runestone Academy",
        "url": "https://runestone.academy/ns/books/published/ac1/scatter_plots_and_correlation/creating_a_scatter_plot_in_sheets.html",
        "title": "Creating a scatter plot in Sheets",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [],
    "snippets": [],
    "related": []
  },
  {
    "id": "summary-stats",
    "title": "Calculate centre and spread in Sheets",
    "category": "Data and graphs",
    "tool": "sheets",
    "when": "When summary statistics help describe a numerical distribution or compare relevant groups.",
    "steps": [
      "Identify which observations each summary should describe. Keep group membership and missing-value decisions clear.",
      "Use AVERAGE or MEDIAN on the intended range, choosing the summary because it is appropriate to the distribution.",
      "For standard deviation, distinguish a sample estimate (STDEV) from describing the full stated population (STDEVP). Do not choose by which number looks better.",
      "Compare groups using compatible units and scope. Inspect distributions as well as summary numbers."
    ],
    "check": "A group average does not describe every individual. Outliers can affect mean and spread differently.",
    "after": "Explain the comparison in context and a relevant limitation; do not include every statistic simply because it is available.",
    "sources": [
      {
        "publisher": "Lehman College",
        "url": "https://www.lehman.cuny.edu/dare/instructional-videos/",
        "title": "DARE instructional videos and chapter timings",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [
      {
        "url": "https://www.lehman.cuny.edu/dare/instructional-videos/",
        "publisher": "Lehman College",
        "find": "Calculating and Interpreting Measures of Central Tendency Using Google sheets",
        "duration": "About 5 minutes (publisher)",
        "note": "Publisher chapters: 0:41-4:00 calculation; 4:01 onwards interpretation. Spread is covered in the written steps, not this video.",
        "status": "publisher-listed",
        "watchedInFull": false,
        "captions": "Not verified; written steps are available here",
        "checkedAt": "2026-10-15"
      }
    ],
    "snippets": [
      [
        "Mean",
        "=AVERAGE(A2:A7)"
      ],
      [
        "Median",
        "=MEDIAN(A2:A7)"
      ],
      [
        "Sample standard deviation",
        "=STDEV(A2:A7)"
      ]
    ],
    "related": [
      "distribution-graphs"
    ]
  },
  {
    "id": "distribution-graphs",
    "title": "Make a histogram or box plot in Desmos",
    "category": "Data and graphs",
    "tool": "desmos",
    "when": "When a distribution or comparison of numerical groups matters to the aim.",
    "steps": [
      "Enter a checked numerical list. Give different groups separate lists with meaningful descriptions.",
      "Use histogram or boxplot with the relevant list. Adjust histogram bin width deliberately.",
      "Compare groups on compatible scales. Check the effect of bin choices or isolated observations.",
      "Describe centre, spread, shape or outliers only as supported by the display."
    ],
    "check": "A histogram is not a bar chart of arbitrary categories. A bin-width choice can change the visible impression.",
    "after": "Record what the graph adds beyond the summary statistics and what it suggests about your question.",
    "sources": [
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/360022405991-Data-Visualizations",
        "title": "Data visualisations",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      },
      {
        "publisher": "Mathispower4u",
        "url": "https://mathispower4u.com/ti-calc.php",
        "title": "Desmos graphing calculator video catalogue",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [
      {
        "url": "https://mathispower4u.com/ti-calc.php",
        "publisher": "Mathispower4u",
        "find": "Desmos section: Dot Plots, Histograms, and Box Plots",
        "duration": "",
        "note": "Video catalogue; locate this exact title. Interface and captions have not been fully previewed.",
        "status": "publisher-listed",
        "watchedInFull": false,
        "captions": "Not verified; written steps are available here",
        "checkedAt": "2026-10-15"
      }
    ],
    "snippets": [
      [
        "Practice list and histogram",
        "L=[2,3,3,4,5,7]\nhistogram(L,1)"
      ],
      [
        "Practice box plot",
        "boxplot(L)"
      ]
    ],
    "related": []
  },
  {
    "id": "forms",
    "title": "Prepare a survey and view responses in Sheets",
    "category": "Data and graphs",
    "tool": "forms",
    "when": "Only for a justified primary-data plan; permission must be settled before affected collection begins.",
    "steps": [
      "Define what each question will measure and who should respond. Avoid collecting unnecessary names or sensitive information.",
      "Build a draft in Google Forms and test the questions yourself. Check units, allowed responses and whether results will be usable for the aim.",
      "Review sampling, access and consent with your teacher before sharing the live form.",
      "Use the Responses section to view results in Sheets. Keep the original responses and document any working-copy transformations."
    ],
    "check": "A working form does not make a sample representative or mean permission is granted. Do not collect restricted data while waiting.",
    "after": "Describe the method actually used and its scope, not merely the form settings.",
    "sources": [
      {
        "publisher": "Lehman College",
        "url": "https://www.lehman.cuny.edu/dare/instructional-videos/",
        "title": "DARE instructional videos and chapter timings",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [
      {
        "url": "https://www.lehman.cuny.edu/dare/instructional-videos/",
        "publisher": "Lehman College",
        "find": "Preparing Surveys Using Google Forms",
        "duration": "About 15 minutes (publisher)",
        "note": "Publisher chapters: 1:00-8:08 questions; 12:01 onwards responses. Some content addresses teachers.",
        "status": "publisher-listed",
        "watchedInFull": false,
        "captions": "Not verified; written steps are available here",
        "checkedAt": "2026-10-15"
      }
    ],
    "snippets": [],
    "related": [
      "organise",
      "two-way"
    ]
  },
  {
    "id": "two-way",
    "title": "Build and interpret a two-way frequency table",
    "category": "Data and graphs",
    "tool": "sheets",
    "when": "For two categorical variables, when comparing frequencies or conditional percentages serves the question.",
    "steps": [
      "Keep one row per observation and a column for each category. Check category definitions and missing responses.",
      "Create a pivot table with one category in Rows and the other in Columns. Count a non-empty observation ID as Values.",
      "Check totals against the source data. For percentages, explicitly choose the row, column or whole-table denominator.",
      "Compare the relevant conditional percentages rather than raw counts when group sizes differ."
    ],
    "check": "A table of category counts is not a paired numerical scatter; coding categories as numbers does not justify PMCC.",
    "after": "State which group the percentages refer to and how the comparison answers the aim.",
    "sources": [
      {
        "publisher": "Lehman College",
        "url": "https://www.lehman.cuny.edu/dare/instructional-videos/",
        "title": "DARE instructional videos and chapter timings",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [
      {
        "url": "https://www.lehman.cuny.edu/dare/instructional-videos/",
        "publisher": "Lehman College",
        "find": "Making and Interpreting Bivariate Tables Using Google Sheets",
        "duration": "About 14 minutes (publisher)",
        "note": "Publisher chapters: 0-3:24 table; 4:48-5:33 column percentages; 8:01 onwards interpretation.",
        "status": "publisher-listed",
        "watchedInFull": false,
        "captions": "Not verified; written steps are available here",
        "checkedAt": "2026-10-15"
      }
    ],
    "snippets": [],
    "related": []
  },
  {
    "id": "secondary-data",
    "title": "Find and check published data",
    "category": "Data and graphs",
    "tool": "databank",
    "when": "When seeking a potential published source that matches the investigation aim.",
    "steps": [
      "List the required quantities, units, population or objects, place and dates before searching.",
      "For World Bank DataBank, choose the relevant dataset, countries, indicators and years, then use Download options.",
      "Read indicator definitions, coverage notes and missing-value codes. Confirm whether each row describes an individual, group, country or time point.",
      "Keep the original download, source link and access date. Compare sources before merging, and mark a candidate as unverified until checked."
    ],
    "check": "Published country averages do not establish individual-level relationships. The resource link itself does not verify suitability.",
    "after": "Justify the source and explain any mismatch or restriction that affects the inference.",
    "sources": [
      {
        "publisher": "World Bank",
        "url": "https://datahelpdesk.worldbank.org/knowledgebase/articles/193477-how-do-i-download-data-in-databank",
        "title": "Download data from DataBank",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [],
    "snippets": [],
    "related": []
  },
  {
    "id": "derivatives",
    "title": "Investigate a derivative in Desmos",
    "category": "Calculus and probability",
    "tool": "desmos",
    "when": "After choosing a relevant derivative or optimisation task and checking course suitability.",
    "steps": [
      "Define your function and state its variable, output units and allowed domain.",
      "Use prime notation to plot the derivative. Evaluate a derivative at an intended input when a rate is needed.",
      "For optimisation, examine candidate stationary points as well as relevant boundaries and constraints.",
      "Use mathematical reasoning to verify the result; a plotted stationary point alone does not prove a global optimum."
    ],
    "check": "A derivative has output-units per input-unit. Check angle mode and any points where the derivative is undefined.",
    "after": "Explain the rate or optimum in terms of your aim. Apply familiar syllabus mathematics directly; explain unfamiliar components when needed.",
    "sources": [
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/4406809433613-Derivatives",
        "title": "Derivatives",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [
      {
        "url": "https://help.desmos.com/hc/en-us/articles/4406809433613-Derivatives",
        "publisher": "Desmos",
        "find": "Official derivative video near the top of the guide",
        "duration": "",
        "note": "",
        "status": "publisher-listed",
        "watchedInFull": false,
        "captions": "Not verified; written steps are available here",
        "checkedAt": "2026-10-15"
      }
    ],
    "snippets": [
      [
        "Practice function and derivative",
        "f(x)=x^3-3x\nf'(x)"
      ]
    ],
    "related": []
  },
  {
    "id": "integrals",
    "title": "Evaluate a definite integral in Desmos",
    "category": "Calculus and probability",
    "tool": "desmos",
    "when": "After justifying the quantity being accumulated, the integrand and the bounds.",
    "steps": [
      "Write the integral mathematically first, including the differential and bounds. State what the integrand represents.",
      "Type int in a Desmos expression to open the integral template, then enter lower and upper limits, function and differential.",
      "Check whether you need signed accumulation, total area or the difference of two curves. Split the interval where necessary.",
      "Check the value independently where feasible and retain the scale conversion appropriate to area or volume."
    ],
    "check": "An integral can be negative when signed accumulation is intended. Integrating an uncalibrated photograph does not automatically give square centimetres.",
    "after": "Explain the numerical value and its units for the aim, using only a justified model and interval.",
    "sources": [
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/4406810279693-Integrals",
        "title": "Integrals",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [
      {
        "url": "https://help.desmos.com/hc/en-us/articles/4406810279693-Integrals",
        "publisher": "Desmos",
        "find": "Official integral video near the top of the guide",
        "duration": "",
        "note": "",
        "status": "publisher-listed",
        "watchedInFull": false,
        "captions": "Not verified; written steps are available here",
        "checkedAt": "2026-10-15"
      }
    ],
    "snippets": [],
    "related": []
  },
  {
    "id": "normal",
    "title": "Use a normal model in Desmos",
    "category": "Calculus and probability",
    "tool": "desmos",
    "when": "When a normal model has been justified and a probability or boundary is needed.",
    "steps": [
      "Identify the model mean and standard deviation, not variance. Sketch the event before using software.",
      "Enter normaldist(mean,standard deviation), replacing both inputs with your justified values.",
      "Use the cumulative-probability options for the intended interval or tail. Check the bounds rather than accepting defaults.",
      "Interpret the probability under the stated model and assumptions."
    ],
    "check": "The height of a probability density curve is not the probability at a single continuous value.",
    "after": "Explain what the event means in your context and what limits the normal-model assumption.",
    "sources": [
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/360022401451-Probability-Distributions",
        "title": "Probability distributions",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      },
      {
        "publisher": "Mathispower4u",
        "url": "https://mathispower4u.com/ti-calc.php",
        "title": "Desmos graphing calculator video catalogue",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [],
    "snippets": [
      [
        "Practice model only",
        "normaldist(10,2)"
      ]
    ],
    "related": []
  },
  {
    "id": "binomial",
    "title": "Use a binomial model in Desmos",
    "category": "Calculus and probability",
    "tool": "desmos",
    "when": "For a justified fixed-trial model with two outcomes, independent trials and constant success probability.",
    "steps": [
      "Define success, trial count n and probability p. Check the assumptions before using the model.",
      "Enter binomialdist(n,p) using your values; n must be a non-negative integer and p between 0 and 1.",
      "For an exact count or cumulative event, check which integers are included. For P(X<k), the cumulative endpoint is k-1.",
      "Compare the software event with the event you wrote mathematically."
    ],
    "check": "Repeated observations are not automatically independent. A fitted probability is not necessarily constant across conditions.",
    "after": "State the event, model parameters and meaning of the probability for your aim.",
    "sources": [
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/360022401451-Probability-Distributions",
        "title": "Probability distributions",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      },
      {
        "publisher": "Mathispower4u",
        "url": "https://mathispower4u.com/ti-calc.php",
        "title": "Desmos graphing calculator video catalogue",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [
      {
        "url": "https://mathispower4u.com/ti-calc.php",
        "publisher": "Mathispower4u",
        "find": "Desmos section: Graph a Binomial Distribution and Find Probabilities Using Desmos",
        "duration": "",
        "note": "",
        "status": "publisher-listed",
        "watchedInFull": false,
        "captions": "Not verified; written steps are available here",
        "checkedAt": "2026-10-15"
      }
    ],
    "snippets": [
      [
        "Practice model only",
        "binomialdist(10,0.3)"
      ]
    ],
    "related": []
  },
  {
    "id": "inference",
    "title": "Use a statistical test you have already justified",
    "category": "Calculus and probability",
    "tool": "desmos",
    "when": "Only after selecting a specific test, checking its assumptions and confirming course suitability or teacher guidance.",
    "steps": [
      "Write the null and alternative hypotheses, planned significance level and the specific question the test addresses.",
      "Open Add Item > Inference and select that test. Enter checked data or justified summary statistics, as appropriate.",
      "Check sample types, tails, degrees of freedom and any expected-frequency conditions. Do not run multiple tests to search for significance.",
      "Record the actual output and interpret it conditionally on the assumptions."
    ],
    "check": "A p-value is not the probability that the null hypothesis is true. A menu option does not establish course suitability.",
    "after": "Discuss the evidence for your question, not just whether a threshold was crossed. No automatic claim of causation or proof.",
    "sources": [
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/36537968880141-Inference",
        "title": "Inference",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [],
    "snippets": [],
    "related": []
  },
  {
    "id": "digitise",
    "title": "Extract approximate values from a published graph",
    "category": "Pictures and curves",
    "tool": "webplotdigitizer",
    "when": "When original numerical data cannot reasonably be obtained and approximate digitisation is defensible.",
    "steps": [
      "First seek the underlying data. Keep the original graph, citation, axes and units if digitisation remains necessary.",
      "Load the image into WebPlotDigitizer. Choose the appropriate plot type and calibrate using known axis values.",
      "Check linear versus logarithmic scales. Extract points manually or with a suitable assisted method, then compare them against visible ticks.",
      "Export the working values and record the extraction process and its uncertainty."
    ],
    "check": "Digitised coordinates are approximations to an existing graph, not newly measured exact data. Do not erase the original provenance.",
    "after": "Explain why extraction was needed and how its precision limits the mathematical claims.",
    "sources": [
      {
        "publisher": "Automeris",
        "url": "https://automeris.io/docs/digitize/",
        "title": "Digitise charts",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      },
      {
        "publisher": "Automeris",
        "url": "https://automeris.io/docs/tutorials/",
        "title": "Tutorial and demo (older interface)",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [
      {
        "url": "https://automeris.io/docs/tutorials/",
        "publisher": "Automeris",
        "find": "Official Tutorial Video",
        "duration": "",
        "note": "The developer explicitly identifies this as an older-interface tutorial; use the current written guide too.",
        "status": "publisher-listed",
        "watchedInFull": false,
        "captions": "Not verified; written steps are available here",
        "checkedAt": "2026-10-15"
      }
    ],
    "snippets": [],
    "related": []
  },
  {
    "id": "accessible-desmos",
    "title": "Use Desmos with a screen reader",
    "category": "Writing and access",
    "tool": "desmos",
    "when": "An alternative way to access graphing, tables and model outputs.",
    "steps": [
      "Open the Perkins tutorial collection and use the transcript or relevant video for your current task.",
      "Work through the table and graph controls with your screen reader before using your investigation data.",
      "Check the calculator's accessibility and audio-trace instructions for your setup.",
      "Use a verbal description and mathematical reasoning to communicate what the graph establishes."
    ],
    "check": "A tutorial for JAWS may not match every screen reader. Written steps and the linked transcripts remain available.",
    "after": "Choose representations and explanations that communicate the mathematics clearly to your reader.",
    "sources": [
      {
        "publisher": "Perkins School for the Blind",
        "url": "https://www.perkins.org/resource/mathematical-modeling-with-desmos-and-jaws-2/",
        "title": "Mathematical modelling with Desmos and JAWS",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      },
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/4406040715149-Getting-Started-Desmos-Graphing-Calculator",
        "title": "Getting started",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [
      {
        "url": "https://www.perkins.org/resource/mathematical-modeling-with-desmos-and-jaws-2/",
        "publisher": "Perkins School for the Blind",
        "find": "Choose the relevant staged video or transcript: tables, regression or interpretation",
        "duration": "",
        "note": "",
        "status": "publisher-listed",
        "watchedInFull": false,
        "captions": "Not verified; written steps are available here",
        "checkedAt": "2026-10-15"
      }
    ],
    "snippets": [],
    "related": []
  },
  {
    "id": "reporting-precision",
    "title": "Report accuracy without inventing precision",
    "category": "Writing and checking",
    "tool": "general",
    "when": "When reporting a measured, sourced or derived quantity, using the decisions that actually affect it.",
    "steps": [
      "Identify the quantities used in this result, their units and the source or instrument resolution. Link those decisions in your mathematical record.",
      "Retain adequate working digits. Where a result is exact, preserve the exact form unless an approximation is useful for the context.",
      "Choose a defensible final reporting precision. Do not copy the decimal-place count of one input into a different derived quantity automatically.",
      "Use an approximation sign for a rounded result. Revisit an earlier decision only when the source, scale or intended interpretation changes."
    ],
    "check": "Resolution alone is not a justified uncertainty estimate. Do not claim a formal error bound you have not established.",
    "after": "State a new accuracy decision where first needed; later results should apply it rather than repeat an accuracy essay.",
    "sources": [
      {
        "publisher": "Google",
        "url": "https://support.google.com/docs/answer/3093990?hl=en",
        "title": "CORREL function",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      },
      {
        "publisher": "Desmos",
        "url": "https://help.desmos.com/hc/en-us/articles/212235786-Supported-Functions",
        "title": "Supported statistical and graphing functions",
        "checkedAt": "2026-10-15",
        "verification": "Publisher page checked; not a guarantee of future availability"
      }
    ],
    "videos": [],
    "snippets": [],
    "related": []
  },
  {
    "id": "finance-model-sheet",
    "title": "Build and check a financial scenario in Google Sheets",
    "category": "Financial models",
    "tool": "sheets",
    "when": "When comparing justified compound growth, sales profit, cash flows, discounted values or financial sensitivity scenarios.",
    "steps": [
      "Make a separate practice or working-copy sheet. Label each input with meaning, units, time period and the original source; keep assumed teaching values distinct from real evidence.",
      "Create an input block for starting amount, rate type and period, price, cost, quantity or cash flows as relevant. Write one short mathematical model alongside the sheet before using functions.",
      "For a quoted nominal annual rate compounded monthly, use the monthly rate divided by 12 only when that convention is explicitly given. For example =1200*(1+6%/12)^12. Do not treat an effective annual rate as nominal.",
      "For a project with cash paid now and year-end receipts, enter =-1000+NPV(10%,600,600). Sheets NPV() discounts its first cash-flow argument by one period, so add time-zero cash separately.",
      "Copy the model for clearly named scenarios or build a small table of input changes. Check formula references, signs, dates, units, feasible ranges and the effect of simultaneous assumptions.",
      "Retain a short, labelled calculation or diagram and the explanation of why inputs are reasonable in your IA. Keep the full spreadsheet as supporting working rather than pasting many routine rows."
    ],
    "check": "Can you explain the mathematical formula, the sign and timing of each amount, and what decision would change if a chosen input changes? Software does not validate your assumptions.",
    "after": "Interpret the numerical result against the actual aim, including at least one consequential limitation. These illustrative amounts are not a prediction or real market offer.",
    "sources": [
      {"publisher":"Google Docs Editors Help","url":"https://support.google.com/docs/answer/46977?hl=en","title":"Add formulas and functions in Sheets","checkedAt":"2026-10-25","verification":"Official Google Sheets help; usage examples checked"},
      {"publisher":"Google Docs Editors Help","url":"https://support.google.com/docs/answer/3093184?hl=en","title":"NPV function","checkedAt":"2026-10-25","verification":"Official function syntax and time-period convention checked"},
      {"publisher":"Google Docs Editors Help","url":"https://support.google.com/docs/table/25273?hl=en","title":"Google Sheets function list","checkedAt":"2026-10-25","verification":"Official function list checked"}
    ],
    "videos": [],
    "snippets": [["Fictional compound example","=1200*(1+6%/12)^12"],["Time-zero cash outflow plus future receipts","=-1000+NPV(10%,600,600)"]],
    "related": ["finance-loan-sheet","reporting-precision"]
  },
  {
    "id": "finance-loan-sheet",
    "title": "Create and verify a loan repayment table in Sheets",
    "category": "Financial models",
    "tool": "sheets",
    "when": "When a constant-periodic-rate loan with equal end-of-period payments is genuinely suitable for the investigation.",
    "steps": [
      "Record loan principal, interest rate PER PAYMENT PERIOD, number of payments, payment timing, fees and any known changes. Convert a nominal annual rate to periods only when the quotation defines that convention.",
      "Calculate a positive scheduled end-of-period payment using =-PMT(1%,12,1200). For a positive loan present value, Sheets gives a negative signed cash flow, so the minus sign displays the amount paid.",
      "Create columns period, opening balance, periodic interest, payment, principal repaid, and closing balance. For each row, interest = opening balance * periodic rate; principal repaid = payment - interest.",
      "For payments at period end, closing balance = opening balance + interest - payment. Use that new closing balance as the next period's opening balance, never the original principal again.",
      "Check whether the idealised final balance is approximately zero using unrounded calculations. Displaying cents can leave a small residual; an actual lender may adjust the last payment.",
      "Compare total payments with the initial principal and identify fees or early-payment changes separately. Do not treat a nominal model without fees as a quoted real APR or an actual repayment schedule."
    ],
    "check": "Does month one give interest = opening balance times periodic rate, principal repaid = payment minus interest, and next balance = old balance plus interest minus payment? Verify rate and payment timing.",
    "after": "Show a few mathematically informative rows and a clear explanation of total costs. An affordability judgement needs cash-flow timing and source-verified terms, not only the payment amount.",
    "sources": [
      {"publisher":"Google Docs Editors Help","url":"https://support.google.com/docs/answer/3093185?hl=en","title":"PMT function","checkedAt":"2026-10-25","verification":"Official rate, period, present-value and payment-timing syntax checked"},
      {"publisher":"Google Docs Editors Help","url":"https://support.google.com/docs/answer/3093175?hl=en","title":"IPMT function","checkedAt":"2026-10-25","verification":"Official interest-component syntax checked"},
      {"publisher":"Google Docs Editors Help","url":"https://support.google.com/docs/answer/3093187?hl=en","title":"PPMT function","checkedAt":"2026-10-25","verification":"Official principal-component syntax checked"}
    ],
    "videos": [],
    "snippets": [["Fictional level-payment check","=-PMT(1%,12,1200)"],["Loan recurrence (model, not an actual offer)","=opening_balance*(1+periodic_rate)-payment"]],
    "related": ["finance-model-sheet","reporting-precision"]
  }
];

export const resourceById = id => RESOURCES.find(r => r.id === id);
export const PRACTICE_PAIRS = "x (practice units)\ty (practice units)\n1\t2\n2\t4\n3\t5\n4\t4\n5\t5\n6\t7";
