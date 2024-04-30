import React from "react";

export type SettingsIconProps = { width?: number; height?: number };

const SettingsIcon: React.FC<SettingsIconProps> = ({
  width = 30,
  height = 30,
}) => {
  return (
    <svg
      version="1.1"
      id="svg105"
      width={width}
      height={height}
      viewBox="0 0 834.8927 830.79834"
      xmlns="http://www.w3.org/2000/svg"
      fill="#fff"
    >
      <defs id="defs109" />

      <g id="g111" transform="translate(-12.08848,-35.893108)">
        <path
          d="m 363.68765,866.21128 c -0.27273,-0.44999 -4.39945,-10.49317 -9.1705,-22.31817 -4.77104,-11.825 -10.64342,-25.55 -13.04972,-30.5 -14.40626,-29.63504 -34.70686,-36.72175 -52.186,-18.21754 -7.30446,7.73283 -11.93975,16.45453 -23.90242,44.97446 -5.93885,14.15869 -11.16164,25.74308 -11.6062,25.74308 -0.69528,0 -60.48277,-24.86041 -100.0495,-41.60188 -7.01686,-2.96896 -13.21848,-5.39812 -13.78139,-5.39812 -2.79882,0 -1.27616,-4.99728 8.9042,-29.22298 14.74805,-35.09522 17.28272,-46.11317 13.53736,-58.84552 -1.18467,-4.02731 -2.82834,-6.6249 -6.35781,-10.04765 -6.02229,-5.8402 -11.69838,-7.39667 -24.05451,-6.59616 -10.48202,0.6791 -15.85558,2.41565 -47.28545,15.28097 -14.04267,5.74815 -24.15463,9.36961 -24.67171,8.83583 -0.4819,-0.49747 -5.92379,-13.27949 -12.09307,-28.40449 -6.16928,-15.125 -16.75538,-41 -23.52467,-57.5 l -12.30778,-30 3.69637,-1.71558 c 3.72396,-1.72839 8.25996,-3.61289 35.69637,-14.83017 17.34109,-7.08985 24.85747,-11.36158 32.39329,-18.40988 12.72973,-11.90619 13.43462,-25.63921 1.95522,-38.09289 -8.07003,-8.75495 -14.78195,-12.4154 -49.2869,-26.87945 -12.61612,-5.28851 -23.09794,-9.77502 -23.29294,-9.97003 -0.49555,-0.49554 1.42694,-5.25244 18.63201,-46.102 8.33939,-19.8 18.39271,-43.7625 22.34071,-53.25 3.948,-9.4875 7.53655,-17.25 7.97457,-17.25 0.43802,0 11.93111,4.67965 25.54022,10.39922 29.67367,12.47112 36.21297,14.60537 46.9617,15.32698 14.41426,0.9677 23.37716,-3.32353 27.99097,-13.40143 2.36207,-5.15944 2.50005,-6.29558 2.02573,-16.68065 -0.59091,-12.93792 -1.44486,-15.68649 -15.69189,-50.50716 -5.03247,-12.29967 -8.97512,-22.53786 -8.76145,-22.75153 0.21367,-0.21368 8.2253,-3.58278 17.80363,-7.4869 9.57832,-3.90412 28.44013,-11.60163 41.91513,-17.10557 49.32091,-20.14541 55.90651,-22.79296 56.69601,-22.79296 0.44266,0 2.2361,3.4875 3.98543,7.75 1.74933,4.2625 6.54462,15.9566 10.65619,25.9869 8.90938,21.73469 12.95551,29.23435 19.83058,36.75677 11.97912,13.10706 25.76283,14.21667 38.5238,3.10122 7.46367,-6.50125 13.15099,-16.67937 25.43053,-45.51094 8.04992,-18.90068 12.18898,-27.50333 13.14846,-27.32786 0.77016,0.14086 10.58675,4.10657 21.81465,8.81269 11.22789,4.70613 36.61435,15.34094 56.41435,23.63292 19.8,8.29198 36.31726,15.35353 36.70503,15.69234 0.38777,0.33881 -1.30353,5.33876 -3.75844,11.11099 -2.45491,5.77223 -4.70307,11.39497 -4.99591,12.49497 -0.29284,1.1 3.10078,-1.825 7.54137,-6.5 10.52745,-11.08316 15.501,-20.51694 14.77886,-28.0324 -0.54591,-5.6814 -2.76867,-9.32007 -7.77447,-12.72685 -6.76094,-4.60127 -11.99921,-5.44257 -37.24644,-5.98203 l -23.75,-0.50748 v -44.79982 -44.79982 l 25.25,-0.35275 c 22.06852,-0.3083 25.817,-0.59247 29.75,-2.25529 14.14769,-5.98147 17.28394,-14.69622 10.31385,-28.6592 -3.07798,-6.16602 -6.29527,-10.03814 -19.5,-23.46896 -8.69762,-8.84652 -15.81385,-16.33395 -15.81385,-16.63873 0,-0.38693 54.44653,-54.9469 62.57314,-62.7035 0.24596,-0.23476 8.02713,7.07074 17.2915,16.23444 14.18374,14.02961 17.90245,17.15644 23.54352,19.79621 5.65382,2.64574 7.55556,3.06392 12.187,2.67985 7.25662,-0.60178 10.15201,-2.87244 14.40484,-11.29677 l 3.5,-6.93306 0.33827,-25.27692 0.33828,-25.27692 h 44.80915 44.80916 l 0.42644,24.25 c 0.35051,19.93235 0.74317,25.14024 2.20537,29.25 5.89601,16.5717 18.62238,20.04078 34.33431,9.35921 2.60646,-1.77197 11.61658,-9.98674 20.02249,-18.25505 l 15.28348,-15.03327 31.6737,31.6737 31.6737,31.6737 -17.01451,17.29086 c -17.38761,17.67 -20.88543,22.50921 -22.44858,31.05739 -1.52962,8.36487 3.04535,15.76496 12.17431,19.69213 6.16792,2.65337 19.61114,3.98217 40.62443,4.01553 l 16.25,0.0258 v 44.38526 44.38526 l -23.75,0.48271 c -18.57371,0.37749 -24.94872,0.85603 -29.25,2.19563 -15.71955,4.89573 -20.08426,14.79705 -12.93616,29.34561 2.67844,5.45144 6.38553,9.84601 19.82152,23.49742 l 16.52691,16.7919 -31.66424,31.66424 -31.66424,31.66424 -16.7919,-16.52691 c -13.65141,-13.43599 -18.04598,-17.14308 -23.49742,-19.82152 -16.60293,-8.15747 -28.07977,-0.71807 -30.75997,19.93889 -0.53501,4.1235 -0.98664,16.15977 -1.00362,26.74727 l -0.0309,19.25 h -45 -45 v -22.7899 c 0,-24.83804 -0.95701,-31.47516 -5.54206,-38.43581 -4.65351,-7.06457 -10.81435,-9.30693 -19.47854,-7.0896 -2.97747,0.76199 -7.4534,2.69892 -9.94649,4.30429 -4.15153,2.67327 -17.22224,15.01102 -15.9028,15.01102 0.31213,0 4.79805,-1.77361 9.9687,-3.94136 5.17066,-2.16775 9.69367,-3.63025 10.05114,-3.25 0.9047,0.96236 48.01099,116.36464 47.64612,116.72479 -0.16284,0.16074 -9.97107,4.19451 -21.79607,8.96395 -27.82008,11.22081 -38.10728,16.14326 -45.58873,21.81433 -16.86883,12.78686 -18.90745,29.03205 -5.33885,42.54375 8.71535,8.67881 17.625,13.37464 52.65636,27.7525 10.57583,4.34062 19.23724,8.34204 19.2476,8.89204 0.0104,0.55 -6.98534,17.65 -15.54598,38 -8.56063,20.35 -19.41267,46.225 -24.11563,57.5 -4.70296,11.275 -8.65973,20.62451 -8.79282,20.77668 -0.13309,0.15217 -11.44247,-4.41452 -25.13196,-10.14822 -34.30909,-14.36999 -35.79224,-14.83571 -48.88999,-15.352 -12.06058,-0.4754 -15.58281,0.39801 -21.42313,5.31231 -5.21901,4.39151 -7.37704,9.76508 -7.87593,19.61138 -0.61933,12.22355 1.17988,18.68091 13.98515,50.19265 6.01057,14.79105 10.56506,27.25545 10.12111,27.69868 -0.75341,0.75216 -10.14396,4.67012 -63.8072,26.62186 -11.55,4.7247 -27.525,11.27269 -35.5,14.5511 -7.975,3.27841 -15.01698,6.16576 -15.64885,6.41633 -0.63187,0.25057 -1.37199,0.0874 -1.64472,-0.3626 z M 335.98122,676.9449 c 69.3269,-17.06649 105.1483,-91.45807 75.00896,-155.77375 -15.05703,-32.13085 -44.78876,-54.8793 -80.84693,-61.85787 -9.84862,-1.90607 -30.25994,-1.82637 -39.95419,0.15601 -51.00144,10.42929 -86.52767,50.55213 -90.71919,102.45699 -2.47947,30.70421 11.61776,65.9344 35.21706,88.01038 16.34182,15.28698 35.92524,24.51544 62.29429,29.35547 6.29096,1.15471 30.75579,-0.31772 39,-2.34723 z M 493.37606,422.91617 c 6.79616,-1.11296 15.42408,-3.55809 17.60516,-4.98926 1.20369,-0.78983 -3.2394,-5.7301 -22.49219,-25.00903 -13.1957,-13.21362 -24.26227,-24.02477 -24.59237,-24.02477 -0.33011,0 -1.8699,4.13915 -3.42176,9.1981 -4.011,13.07558 -4.04937,24.1019 -0.11187,32.14986 5.34316,10.92101 16.819,15.32708 33.01303,12.6751 z M 652.77338,322.3156 c 15.09924,-3.09025 26.41194,-9.01209 38.05862,-19.92249 32.72166,-30.65306 33.39231,-81.57203 1.4853,-112.77121 -10.53209,-10.29845 -21.45171,-16.6144 -35.33608,-20.43852 -8.96104,-2.4681 -30.84252,-2.43739 -40,0.0562 -25.72907,7.00589 -46.88332,27.44355 -55.01728,53.15358 -3.41154,10.78331 -3.92644,30.32661 -1.09451,41.54332 7.5118,29.75282 30.4675,51.93426 60.51148,58.47052 8.42216,1.83229 22.18912,1.79223 31.39247,-0.0914 z"
          id="path223"
        />
      </g>
    </svg>
  );
};

export default SettingsIcon;