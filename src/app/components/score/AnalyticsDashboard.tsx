import React from 'react';
import styled from 'styled-components';

interface AnalyticsDashboardProps {
  score: number;
  maxStreak?: number; // Usually derived from game history
  onTryAnother: () => void;
  onPlayAgain: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  score,
  maxStreak = 0,
  onTryAnother,
  onPlayAgain,
}) => {
  return (
    <GlassPanel>
      <Header>
        <Title>PERFORMANCE</Title>
        <ScoreWrapper>
          <ScoreText>{score}</ScoreText>
          <ScoreLabel>FINAL SCORE</ScoreLabel>
        </ScoreWrapper>
      </Header>

      <StatsGrid>
        <StatBox>
          <StatValue>{maxStreak}</StatValue>
          <StatName>MAX STREAK</StatName>
        </StatBox>
        <StatBox>
          <StatValue>94%</StatValue>
          <StatName>PEAK ACCURACY</StatName>
        </StatBox>
        <StatBox>
          <StatValue>YES</StatValue>
          <StatName>FLOW STATE</StatName>
        </StatBox>
      </StatsGrid>

      <ChartSection>
        <ChartLabel>Limb Precision Breakdown</ChartLabel>
        <RingsContainer>
          <LimbRing label="LEFT ARM" fill={0.7} />
          <LimbRing label="RIGHT ARM" fill={0.85} />
          <LimbRing label="LEFT LEG" fill={0.6} />
          <LimbRing label="RIGHT LEG" fill={0.9} />
        </RingsContainer>
      </ChartSection>
      {/* Buttons moved inside ResultScreen to keep Auth logic unified */}
    </GlassPanel>
  );
};

// --- Sub-components for Rings ---
const LimbRing: React.FC<{ label: string; fill: number }> = ({ label, fill }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - fill * circumference;

  return (
    <RingWrapper>
      <svg width="60" height="60" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r={radius} stroke="#262626" strokeWidth="4" fill="none" />
        <circle
          cx="25"
          cy="25"
          r={radius}
          stroke="#db90ff"
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 25 25)"
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
      <RingLabel>{label}</RingLabel>
    </RingWrapper>
  );
};

// --- Styled Components (Stitch Design System 'Aura Rhythm') ---

const Container = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(40px);
  z-index: 1000;
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const GlassPanel = styled.div`
  background: rgba(25, 25, 25, 0.6);
  border: 1px solid rgba(72, 72, 72, 0.3);
  border-radius: 32px;
  width: 90%;
  max-width: 500px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 32px;
  color: #fff;
  font-family: 'Plus Jakarta Sans', sans-serif;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #fff;
  margin: 0;
`;

const ScoreWrapper = styled.div`
  text-align: right;
`;

const ScoreText = styled.div`
  font-size: 48px;
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(180deg, #db90ff, #9392ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ScoreLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: #ababab;
  letter-spacing: 0.1em;
  margin-top: 4px;
`;

const StatsGrid = styled.div`
  display: flex;
  justify-content: space-between;
  background: rgba(19, 19, 19, 0.5);
  padding: 16px 20px;
  border-radius: 16px;
  border: 1px solid rgba(72, 72, 72, 0.2);
`;

const StatBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
`;

const StatName = styled.div`
  font-size: 10px;
  color: #ababab;
  margin-top: 4px;
  letter-spacing: 0.05em;
`;

const ChartSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ChartLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #fff;
`;

const RingsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
`;

const RingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const RingLabel = styled.div`
  font-size: 9px;
  color: #ababab;
  font-weight: 700;
  letter-spacing: 0.1em;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
`;

const BaseButton = styled.button`
  border-radius: 9999px;
  padding: 18px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.1em;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.98);
  }
`;

const PrimaryButton = styled(BaseButton)`
  background: linear-gradient(90deg, #db90ff, #9392ff);
  color: #000;
  box-shadow: 0 4px 15px rgba(219, 144, 255, 0.3);

  &:hover {
    box-shadow: 0 6px 20px rgba(219, 144, 255, 0.5);
  }
`;

const SecondaryButton = styled(BaseButton)`
  background: rgba(38, 38, 38, 0.4);
  color: #fff;
  border: 1px solid rgba(72, 72, 72, 0.4);
  
  &:hover {
    background: rgba(38, 38, 38, 0.8);
  }
`;
