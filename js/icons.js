/*
  Inline SVG markup, ported 1:1 from the native app's VectorDrawable XML
  files (app/src/main/res/drawable/*.xml) -- same pathData, same stroke
  weights/colors, just SVG syntax instead of Android's. Each entry is a
  function so callers can drop the markup directly into innerHTML.

  Android's <group translateX/translateY/pivotX/pivotY/rotation> maps onto
  SVG's transform="translate(x,y) rotate(deg,px,py)" (scale/rotate happens
  in local space first, then the whole group is translated -- same order
  Android itself documents for VectorDrawable groups).
*/
window.BB = window.BB || {};
BB.icons = {
  // Sticker Sheet "Folder" (Figma node 31:2182) -- res/drawable/ic_folder.xml
  folder: () => `
    <svg viewBox="0 0 28 28" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(2.75,5.0833335)">
        <path d="M0.75,15.0833V2.75C0.75,1.64543 1.64543,0.75 2.75,0.75H8.50245C8.76767,0.75 9.02202,0.855357 9.20956,1.04289L11.25,3.08333H19.75C20.8546,3.08333 21.75,3.97876 21.75,5.08333V15.0833C21.75,16.1879 20.8546,17.0833 19.75,17.0833H2.75C1.64543,17.0833 0.75,16.1879 0.75,15.0833Z"
          fill="#ADC8FF" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <g transform="translate(14,7.4167)">
        <path d="M0.75,0.75L9.75,0.75" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
      </g>
    </svg>`,

  // Hand-built (no Figma source) -- res/drawable/ic_spreadsheet_file.xml
  spreadsheetFile: () => `
    <svg viewBox="0 0 28 28" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.75,2.75 H16.5 L21.25,7.5 V24.25 A1,1 0 0,1 20.25,25.25 H6.75 A1,1 0 0,1 5.75,24.25 V3.75 A1,1 0 0,1 6.75,2.75 Z"
        fill="#0000FF" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16.5,2.75 V6.5 A1,1 0 0,0 17.5,7.5 H21.25"
        stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9,12 H18 M9,16 H18 M9,20 H18 M12.5,10 V22 M15.5,10 V22"
        stroke="#FFFFFF" stroke-width="1" stroke-linecap="round"/>
    </svg>`,

  // Sticker Sheet "Check Circle" (Figma node 31:2306) -- res/drawable/ic_check_circle.xml
  checkCircle: () => `
    <svg viewBox="0 0 27 27" width="22.5" height="22.5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.375,13.5 A10.125,10.125 0 1,0 23.625,13.5 A10.125,10.125 0 1,0 3.375,13.5 Z" fill="#FFF8CC"/>
      <g transform="translate(6.875,9.125)">
        <path d="M1,5.5L4.375,8.875L12.25,1" stroke="#149B4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </svg>`,

  // Header close "X" (originally Figma node 31:2323, circle removed per review feedback) -- res/drawable/ic_close_circle.xml
  closeCircle: () => `
    <svg viewBox="0 0 30 30" width="30" height="30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(10.25,10.25)">
        <path d="M1,1L8.5,8.5" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <g transform="translate(10.25,10.25) rotate(90,4.75,4.75)">
        <path d="M1,1L8.5,8.5" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </svg>`,

  // "Access File" progress icon, dark-blue variant (Figma V2 page node 122:1211) -- res/drawable/ic_access_file_dark.xml
  accessFileDark: () => `
    <svg viewBox="0 0 50 42" width="40" height="33.6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M39.2703,19.3474C39.2703,14.9656 35.5512,12.901 30.9636,12.901H30.917C30.9478,12.5744 30.9636,12.2436 30.9636,11.9093C30.9636,5.88424 25.8499,1 19.5418,1C13.2337,1 8.12006,5.88424 8.12006,11.9093C8.12006,11.9186 8.12007,11.928 8.12009,11.9374C4.05765,12.725 1,16.1555 1,20.2681C1,24.9629 4.9847,28.7688 9.90006,28.7688" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M20.5802,18.8516L20.5802,28.7691M16.4268,24.8021L20.5802,28.7691L24.7335,24.8021" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M30.617,22.9474V38C30.617,39.6569 31.9602,41 33.617,41H46C47.6569,41 49,39.6569 49,38V26.5263V22.9474C49,21.2905 47.6569,19.9474 46,19.9474H41.7781H39.8085H33.617C31.9602,19.9474 30.617,21.2905 30.617,22.9474Z" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M36.027,30.4939H43.8108" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M36.027,25.4177H43.8108" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M36.027,35.5704H43.8108" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // "Access File" progress icon, green variant -- res/drawable/ic_access_file_green.xml
  accessFileGreen: () => `
    <svg viewBox="0 0 50 42" width="40" height="33.6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M39.2703,19.3474C39.2703,14.9656 35.5512,12.901 30.9636,12.901H30.917C30.9478,12.5744 30.9636,12.2436 30.9636,11.9093C30.9636,5.88424 25.8499,1 19.5418,1C13.2337,1 8.12006,5.88424 8.12006,11.9093C8.12006,11.9186 8.12007,11.928 8.12009,11.9374C4.05765,12.725 1,16.1555 1,20.2681C1,24.9629 4.9847,28.7688 9.90006,28.7688" stroke="#149B4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M20.5802,18.8516L20.5802,28.7691M16.4268,24.8021L20.5802,28.7691L24.7335,24.8021" stroke="#149B4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M30.617,22.9474V38C30.617,39.6569 31.9602,41 33.617,41H46C47.6569,41 49,39.6569 49,38V26.5263V22.9474C49,21.2905 47.6569,19.9474 46,19.9474H41.7781H39.8085H33.617C31.9602,19.9474 30.617,21.2905 30.617,22.9474Z" stroke="#149B4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M36.027,30.4939H43.8108" stroke="#149B4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M36.027,25.4177H43.8108" stroke="#149B4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M36.027,35.5704H43.8108" stroke="#149B4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // "Choose Month" progress icon, dark-blue variant -- res/drawable/ic_choose_month_dark.xml
  chooseMonthDark: () => `
    <svg viewBox="0 0 38 42" width="38" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M37,16V7C37,5.89543 36.1046,5 35,5H3C1.89543,5 1,5.89543 1,7V16M37,16V39C37,40.1046 36.1046,41 35,41H3C1.89543,41 1,40.1046 1,39V16M37,16H19H1M10,1V9.9441M28,1V9.9441" stroke="#0000FF" stroke-width="2" stroke-linecap="round"/>
      <path d="M16.5,31 L21.5,31 A0.5,0.5 0 0 1 22,31.5 L22,36.5 A0.5,0.5 0 0 1 21.5,37 L16.5,37 A0.5,0.5 0 0 1 16,36.5 L16,31.5 A0.5,0.5 0 0 1 16.5,31 Z" fill="#FFFFFF" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16.5,20 L21.5,20 A0.5,0.5 0 0 1 22,20.5 L22,25.5 A0.5,0.5 0 0 1 21.5,26 L16.5,26 A0.5,0.5 0 0 1 16,25.5 L16,20.5 A0.5,0.5 0 0 1 16.5,20 Z" fill="#FFFFFF" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.5,20 L10.5,20 A0.5,0.5 0 0 1 11,20.5 L11,25.5 A0.5,0.5 0 0 1 10.5,26 L5.5,26 A0.5,0.5 0 0 1 5,25.5 L5,20.5 A0.5,0.5 0 0 1 5.5,20 Z" fill="#FFFFFF" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.5,31 L10.5,31 A0.5,0.5 0 0 1 11,31.5 L11,36.5 A0.5,0.5 0 0 1 10.5,37 L5.5,37 A0.5,0.5 0 0 1 5,36.5 L5,31.5 A0.5,0.5 0 0 1 5.5,31 Z" fill="#FFFFFF" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M27.5,20 L32.5,20 A0.5,0.5 0 0 1 33,20.5 L33,25.5 A0.5,0.5 0 0 1 32.5,26 L27.5,26 A0.5,0.5 0 0 1 27,25.5 L27,20.5 A0.5,0.5 0 0 1 27.5,20 Z" fill="#FFFFFF" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M27.5,31 L32.5,31 A0.5,0.5 0 0 1 33,31.5 L33,36.5 A0.5,0.5 0 0 1 32.5,37 L27.5,37 A0.5,0.5 0 0 1 27,36.5 L27,31.5 A0.5,0.5 0 0 1 27.5,31 Z" fill="#FFFFFF" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // "Choose Month" progress icon, green variant -- res/drawable/ic_choose_month_green.xml
  chooseMonthGreen: () => `
    <svg viewBox="0 0 38 42" width="38" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M37,16V7C37,5.89543 36.1046,5 35,5H3C1.89543,5 1,5.89543 1,7V16M37,16V39C37,40.1046 36.1046,41 35,41H3C1.89543,41 1,40.1046 1,39V16M37,16H19H1M10,1V9.9441M28,1V9.9441" stroke="#149B4C" stroke-width="2" stroke-linecap="round"/>
      <path d="M16.5,31 L21.5,31 A0.5,0.5 0 0 1 22,31.5 L22,36.5 A0.5,0.5 0 0 1 21.5,37 L16.5,37 A0.5,0.5 0 0 1 16,36.5 L16,31.5 A0.5,0.5 0 0 1 16.5,31 Z" fill="#FFFFFF" stroke="#149B4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16.5,20 L21.5,20 A0.5,0.5 0 0 1 22,20.5 L22,25.5 A0.5,0.5 0 0 1 21.5,26 L16.5,26 A0.5,0.5 0 0 1 16,25.5 L16,20.5 A0.5,0.5 0 0 1 16.5,20 Z" fill="#FFFFFF" stroke="#149B4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.5,20 L10.5,20 A0.5,0.5 0 0 1 11,20.5 L11,25.5 A0.5,0.5 0 0 1 10.5,26 L5.5,26 A0.5,0.5 0 0 1 5,25.5 L5,20.5 A0.5,0.5 0 0 1 5.5,20 Z" fill="#FFFFFF" stroke="#149B4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.5,31 L10.5,31 A0.5,0.5 0 0 1 11,31.5 L11,36.5 A0.5,0.5 0 0 1 10.5,37 L5.5,37 A0.5,0.5 0 0 1 5,36.5 L5,31.5 A0.5,0.5 0 0 1 5.5,31 Z" fill="#FFFFFF" stroke="#149B4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M27.5,20 L32.5,20 A0.5,0.5 0 0 1 33,20.5 L33,25.5 A0.5,0.5 0 0 1 32.5,26 L27.5,26 A0.5,0.5 0 0 1 27,25.5 L27,20.5 A0.5,0.5 0 0 1 27.5,20 Z" fill="#FFFFFF" stroke="#149B4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M27.5,31 L32.5,31 A0.5,0.5 0 0 1 33,31.5 L33,36.5 A0.5,0.5 0 0 1 32.5,37 L27.5,37 A0.5,0.5 0 0 1 27,36.5 L27,31.5 A0.5,0.5 0 0 1 27.5,31 Z" fill="#FFFFFF" stroke="#149B4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // "Choose Month" progress icon, light-blue variant (Figma V2 page node 122:1201) -- res/drawable/ic_choose_month_light.xml
  chooseMonthLight: () => `
    <svg viewBox="0 0 38 42" width="38" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M37,16V7C37,5.89543 36.1046,5 35,5H3C1.89543,5 1,5.89543 1,7V16M37,16V39C37,40.1046 36.1046,41 35,41H3C1.89543,41 1,40.1046 1,39V16M37,16H19H1M10,1V9.9441M28,1V9.9441" stroke="#ADC8FF" stroke-width="2" stroke-linecap="round"/>
      <path d="M16.5,31 L21.5,31 A0.5,0.5 0 0 1 22,31.5 L22,36.5 A0.5,0.5 0 0 1 21.5,37 L16.5,37 A0.5,0.5 0 0 1 16,36.5 L16,31.5 A0.5,0.5 0 0 1 16.5,31 Z" fill="#FFFFFF" stroke="#ADC8FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16.5,20 L21.5,20 A0.5,0.5 0 0 1 22,20.5 L22,25.5 A0.5,0.5 0 0 1 21.5,26 L16.5,26 A0.5,0.5 0 0 1 16,25.5 L16,20.5 A0.5,0.5 0 0 1 16.5,20 Z" fill="#FFFFFF" stroke="#ADC8FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.5,20 L10.5,20 A0.5,0.5 0 0 1 11,20.5 L11,25.5 A0.5,0.5 0 0 1 10.5,26 L5.5,26 A0.5,0.5 0 0 1 5,25.5 L5,20.5 A0.5,0.5 0 0 1 5.5,20 Z" fill="#FFFFFF" stroke="#ADC8FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.5,31 L10.5,31 A0.5,0.5 0 0 1 11,31.5 L11,36.5 A0.5,0.5 0 0 1 10.5,37 L5.5,37 A0.5,0.5 0 0 1 5,36.5 L5,31.5 A0.5,0.5 0 0 1 5.5,31 Z" fill="#FFFFFF" stroke="#ADC8FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M27.5,20 L32.5,20 A0.5,0.5 0 0 1 33,20.5 L33,25.5 A0.5,0.5 0 0 1 32.5,26 L27.5,26 A0.5,0.5 0 0 1 27,25.5 L27,20.5 A0.5,0.5 0 0 1 27.5,20 Z" fill="#FFFFFF" stroke="#ADC8FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M27.5,31 L32.5,31 A0.5,0.5 0 0 1 33,31.5 L33,36.5 A0.5,0.5 0 0 1 32.5,37 L27.5,37 A0.5,0.5 0 0 1 27,36.5 L27,31.5 A0.5,0.5 0 0 1 27.5,31 Z" fill="#FFFFFF" stroke="#ADC8FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // "Log Expense" progress icon, light-blue variant (Figma V2 page node 122:1203) -- res/drawable/ic_log_expense_light.xml
  logExpenseLight: () => `
    <svg viewBox="0 0 45.5887 42" width="45.59" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.61938,6.71425L31.0259,6.71425" stroke="#ADC8FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.61938,13.5715H31.0259" stroke="#ADC8FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.61938,20.4286H19.4775" stroke="#ADC8FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.61938,27.2857H19.4775" stroke="#ADC8FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M23.1114,35.233L22.1258,35.0379C22.0598,35.364 22.163,35.7012 22.4007,35.9364C22.6383,36.1716 22.979,36.2736 23.3086,36.2084L23.1114,35.233ZM35.8016,17.7677L35.0909,17.0643L35.0908,17.0643L35.8016,17.7677ZM24.2316,29.6905L23.2459,29.4954L24.2316,29.6905ZM23.1114,35.233L23.3086,36.2084L28.9092,35.0999L28.712,34.1245L28.5149,33.149L22.9143,34.2575L23.1114,35.233ZM44.2891,17.7746L44.9999,17.0712L41.4635,13.5715L40.7527,14.2749L40.0419,14.9783L43.5783,18.478L44.2891,17.7746ZM24.2316,29.6905L23.2459,29.4954L22.1258,35.0379L23.1114,35.233L24.0971,35.4281L25.2172,29.8856L24.2316,29.6905ZM29.7393,33.5804L30.4501,34.2838L41.4704,23.3777L40.7596,22.6743L40.0488,21.9709L29.0286,32.877L29.7393,33.5804ZM40.7596,22.6743L41.4704,23.3777L44.9999,19.8848L44.2891,19.1814L43.5783,18.478L40.0488,21.9709L40.7596,22.6743ZM39.3311,14.2749L38.6203,13.5715L35.0909,17.0643L35.8016,17.7677L36.5124,18.4711L40.0419,14.9783L39.3311,14.2749ZM35.8016,17.7677L35.0908,17.0643L24.0706,27.9704L24.7813,28.6739L25.4921,29.3773L36.5124,18.4711L35.8016,17.7677ZM40.7596,22.6743L41.4704,21.9709L36.5124,17.0643L35.8016,17.7677L35.0909,18.4711L40.0488,23.3777L40.7596,22.6743ZM24.2316,29.6905L25.2172,29.8856C25.2562,29.693 25.3518,29.5161 25.4921,29.3773L24.7813,28.6739L24.0706,27.9704C23.6496,28.3871 23.3626,28.9177 23.2459,29.4954L24.2316,29.6905ZM40.7527,14.2749L41.4635,13.5715C40.6784,12.7945 39.4054,12.7945 38.6203,13.5715L39.3311,14.2749L40.0419,14.9783L40.0419,14.9783L40.7527,14.2749ZM44.2891,17.7746L43.5783,18.478L43.5783,18.478L44.2891,19.1814L44.9999,19.8848C45.785,19.1079 45.785,17.8482 44.9999,17.0712L44.2891,17.7746ZM28.712,34.1245L28.9092,35.0999C29.493,34.9844 30.0292,34.7004 30.4501,34.2838L29.7393,33.5804L29.0286,32.877C28.8882,33.0158 28.7095,33.1105 28.5149,33.149L28.712,34.1245Z" fill="#ADC8FF"/>
      <path d="M35.6453,27.8571V38C35.6453,39.6569 34.3022,41 32.6453,41H4C2.34315,41 1,39.6569 1,38V4C1,2.34315 2.34315,1 4,1H18.3227H22.0346H32.6453C34.3022,1 35.6453,2.34315 35.6453,4V17.5714" stroke="#ADC8FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // "Log Expense" progress icon, dark-blue variant -- res/drawable/ic_log_expense_dark.xml
  logExpenseDark: () => `
    <svg viewBox="0 0 45.5887 42" width="45.59" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.61938,6.71425L31.0259,6.71425" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.61938,13.5715H31.0259" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.61938,20.4286H19.4775" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.61938,27.2857H19.4775" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M23.1114,35.233L22.1258,35.0379C22.0598,35.364 22.163,35.7012 22.4007,35.9364C22.6383,36.1716 22.979,36.2736 23.3086,36.2084L23.1114,35.233ZM35.8016,17.7677L35.0909,17.0643L35.0908,17.0643L35.8016,17.7677ZM24.2316,29.6905L23.2459,29.4954L24.2316,29.6905ZM23.1114,35.233L23.3086,36.2084L28.9092,35.0999L28.712,34.1245L28.5149,33.149L22.9143,34.2575L23.1114,35.233ZM44.2891,17.7746L44.9999,17.0712L41.4635,13.5715L40.7527,14.2749L40.0419,14.9783L43.5783,18.478L44.2891,17.7746ZM24.2316,29.6905L23.2459,29.4954L22.1258,35.0379L23.1114,35.233L24.0971,35.4281L25.2172,29.8856L24.2316,29.6905ZM29.7393,33.5804L30.4501,34.2838L41.4704,23.3777L40.7596,22.6743L40.0488,21.9709L29.0286,32.877L29.7393,33.5804ZM40.7596,22.6743L41.4704,23.3777L44.9999,19.8848L44.2891,19.1814L43.5783,18.478L40.0488,21.9709L40.7596,22.6743ZM39.3311,14.2749L38.6203,13.5715L35.0909,17.0643L35.8016,17.7677L36.5124,18.4711L40.0419,14.9783L39.3311,14.2749ZM35.8016,17.7677L35.0908,17.0643L24.0706,27.9704L24.7813,28.6739L25.4921,29.3773L36.5124,18.4711L35.8016,17.7677ZM40.7596,22.6743L41.4704,21.9709L36.5124,17.0643L35.8016,17.7677L35.0909,18.4711L40.0488,23.3777L40.7596,22.6743ZM24.2316,29.6905L25.2172,29.8856C25.2562,29.693 25.3518,29.5161 25.4921,29.3773L24.7813,28.6739L24.0706,27.9704C23.6496,28.3871 23.3626,28.9177 23.2459,29.4954L24.2316,29.6905ZM40.7527,14.2749L41.4635,13.5715C40.6784,12.7945 39.4054,12.7945 38.6203,13.5715L39.3311,14.2749L40.0419,14.9783L40.0419,14.9783L40.7527,14.2749ZM44.2891,17.7746L43.5783,18.478L43.5783,18.478L44.2891,19.1814L44.9999,19.8848C45.785,19.1079 45.785,17.8482 44.9999,17.0712L44.2891,17.7746ZM28.712,34.1245L28.9092,35.0999C29.493,34.9844 30.0292,34.7004 30.4501,34.2838L29.7393,33.5804L29.0286,32.877C28.8882,33.0158 28.7095,33.1105 28.5149,33.149L28.712,34.1245Z" fill="#0000FF"/>
      <path d="M35.6453,27.8571V38C35.6453,39.6569 34.3022,41 32.6453,41H4C2.34315,41 1,39.6569 1,38V4C1,2.34315 2.34315,1 4,1H18.3227H22.0346H32.6453C34.3022,1 35.6453,2.34315 35.6453,4V17.5714" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // "Log Expense" progress icon, green variant -- res/drawable/ic_log_expense_green.xml
  logExpenseGreen: () => `
    <svg viewBox="0 0 45.5887 42" width="45.59" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.61938,6.71425L31.0259,6.71425" stroke="#149B4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.61938,13.5715H31.0259" stroke="#149B4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.61938,20.4286H19.4775" stroke="#149B4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.61938,27.2857H19.4775" stroke="#149B4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M23.1114,35.233L22.1258,35.0379C22.0598,35.364 22.163,35.7012 22.4007,35.9364C22.6383,36.1716 22.979,36.2736 23.3086,36.2084L23.1114,35.233ZM35.8016,17.7677L35.0909,17.0643L35.0908,17.0643L35.8016,17.7677ZM24.2316,29.6905L23.2459,29.4954L24.2316,29.6905ZM23.1114,35.233L23.3086,36.2084L28.9092,35.0999L28.712,34.1245L28.5149,33.149L22.9143,34.2575L23.1114,35.233ZM44.2891,17.7746L44.9999,17.0712L41.4635,13.5715L40.7527,14.2749L40.0419,14.9783L43.5783,18.478L44.2891,17.7746ZM24.2316,29.6905L23.2459,29.4954L22.1258,35.0379L23.1114,35.233L24.0971,35.4281L25.2172,29.8856L24.2316,29.6905ZM29.7393,33.5804L30.4501,34.2838L41.4704,23.3777L40.7596,22.6743L40.0488,21.9709L29.0286,32.877L29.7393,33.5804ZM40.7596,22.6743L41.4704,23.3777L44.9999,19.8848L44.2891,19.1814L43.5783,18.478L40.0488,21.9709L40.7596,22.6743ZM39.3311,14.2749L38.6203,13.5715L35.0909,17.0643L35.8016,17.7677L36.5124,18.4711L40.0419,14.9783L39.3311,14.2749ZM35.8016,17.7677L35.0908,17.0643L24.0706,27.9704L24.7813,28.6739L25.4921,29.3773L36.5124,18.4711L35.8016,17.7677ZM40.7596,22.6743L41.4704,21.9709L36.5124,17.0643L35.8016,17.7677L35.0909,18.4711L40.0488,23.3777L40.7596,22.6743ZM24.2316,29.6905L25.2172,29.8856C25.2562,29.693 25.3518,29.5161 25.4921,29.3773L24.7813,28.6739L24.0706,27.9704C23.6496,28.3871 23.3626,28.9177 23.2459,29.4954L24.2316,29.6905ZM40.7527,14.2749L41.4635,13.5715C40.6784,12.7945 39.4054,12.7945 38.6203,13.5715L39.3311,14.2749L40.0419,14.9783L40.0419,14.9783L40.7527,14.2749ZM44.2891,17.7746L43.5783,18.478L43.5783,18.478L44.2891,19.1814L44.9999,19.8848C45.785,19.1079 45.785,17.8482 44.9999,17.0712L44.2891,17.7746ZM28.712,34.1245L28.9092,35.0999C29.493,34.9844 30.0292,34.7004 30.4501,34.2838L29.7393,33.5804L29.0286,32.877C28.8882,33.0158 28.7095,33.1105 28.5149,33.149L28.712,34.1245Z" fill="#149B4C"/>
      <path d="M35.6453,27.8571V38C35.6453,39.6569 34.3022,41 32.6453,41H4C2.34315,41 1,39.6569 1,38V4C1,2.34315 2.34315,1 4,1H18.3227H22.0346H32.6453C34.3022,1 35.6453,2.34315 35.6453,4V17.5714" stroke="#149B4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // Frame 8's smiley (Figma V2 page node 22:1332 "Grin"/137:1351 "Group 44") -- res/drawable/ic_smiley_face.xml
  smileyFace: () => `
    <svg viewBox="0 0 122 122" width="122" height="122" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M106.75,61 A45.75,45.75 0 1,0 15.25,61 A45.75,45.75 0 1,0 106.75,61 Z" fill="#FFF8CC" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <g transform="translate(37,41)">
        <path d="M18,5 C16,2.5 13.366,1 9.5,1 C5.634,1 3,2.5 1,5" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
      </g>
      <g transform="translate(66,41)">
        <path d="M18,5 C16,2.5 13.366,1 9.5,1 C5.634,1 3,2.5 1,5" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
      </g>
      <g transform="translate(26,68)">
        <path d="M1,1 C9,11 19.536,17 35,17 C50.464,17 61,11 69,1" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
      </g>
    </svg>`,

  // Double-chevron progress separator (Figma V2 page node 122:1191) -- res/drawable/ic_progress_arrow.xml
  progressArrow: () => `
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.5,5L11.7929,11.2929C12.1834,11.6834 12.1834,12.3166 11.7929,12.7071L5.5,19" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M13.5,5L19.7929,11.2929C20.1834,11.6834 20.1834,12.3166 19.7929,12.7071L13.5,19" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // OneDrive picker breadcrumb-back / cancel-search arrow (Figma V3 node 166:3723) -- res/drawable/ic_arrow_left.xml
  arrowLeft: () => `
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20,12 H4 M10,18 L4,12 L10,6" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // OneDrive picker search-submit arrow (Figma V3 node 166:3964) -- res/drawable/ic_arrow_right.xml
  arrowRight: () => `
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4,12 L20,12 M14,6 L20,12 L14,18" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // Dropdown chevron (Material "keyboard_arrow_down/up", used by MonthDropdownField/LabeledDropdownField) -- color is set by the caller via the `stroke` param, since it varies (black, or the disabled-gray palette).
  chevronDown: (stroke = "#000000") => `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6,9L12,15L18,9" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  chevronUp: (stroke = "#000000") => `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18,15L12,9L6,15" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // Calculator icon next to the Amount field (Figma V3 node 168:4004) -- res/drawable/ic_calculator.xml (shadow applied via CSS box-shadow instead of baked in)
  calculator: () => `
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3,0.75 H21 A2.25,2.25 0 0 1 23.25,3 V21 A2.25,2.25 0 0 1 21,23.25 H3 A2.25,2.25 0 0 1 0.75,21 V3 A2.25,2.25 0 0 1 3,0.75 Z" fill="#ADC8FF" stroke="#000000" stroke-width="1.5"/>
      <path d="M7,9 V4 M4.5,14 L7,16.5 M7,16.5 L9.5,19 M7,16.5 L9.5,14 M7,16.5 L4.5,19 M4.5,6.5 H9.5 M14.5,6.5 H17 H19.5 M14.5,15 H17 H19.5 M14.5,18 H17 H19.5" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
};
