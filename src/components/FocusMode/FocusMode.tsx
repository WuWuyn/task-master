import React, { useState, useEffect } from 'react';
import { Button, InputNumber, Modal, Space, Typography, Progress } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StopOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface FocusModeProps {
  visible: boolean;
  onClose: () => void;
}

const FocusMode: React.FC<FocusModeProps> = ({ visible, onClose }) => {
  const [minutes, setMinutes] = useState<number>(25);
  const [seconds, setSeconds] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSetup, setIsSetup] = useState<boolean>(true);

  const formatTime = (totalSecs: number): string => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (isSetup) {
      const total = minutes * 60 + seconds;
      setTotalSeconds(total);
      setRemainingSeconds(total);
      setIsSetup(false);
    }
    setIsRunning(true);
    enterFullscreen();
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsSetup(true);
    setRemainingSeconds(0);
    exitFullscreen();
  };

  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (error) {
      console.log('Fullscreen not supported or denied');
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.log('Exit fullscreen failed');
    }
  };

  const handleFullscreenToggle = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  const handleClose = () => {
    stopTimer();
    onClose();
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsSetup(true);
            exitFullscreen();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, remainingSeconds]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  // Dynamic color calculation based on progress
  const getThemeColors = () => {
    const progress = progressPercent / 100;
    
    // Green to Red transition
    const red = Math.round(76 + (179 * progress)); // 76 -> 255
    const green = Math.round(175 - (175 * progress)); // 175 -> 0
    const blue = Math.round(80 - (80 * progress)); // 80 -> 0
    
    const primaryColor = `rgb(${red}, ${green}, ${blue})`;
    
    // Secondary color for gradient (darker version)
    const secondaryRed = Math.round(52 + (139 * progress)); // 52 -> 191
    const secondaryGreen = Math.round(121 - (121 * progress)); // 121 -> 0
    const secondaryBlue = Math.round(98 - (98 * progress)); // 98 -> 0
    
    const secondaryColor = `rgb(${secondaryRed}, ${secondaryGreen}, ${secondaryBlue})`;
    
    return { primaryColor, secondaryColor };
  };

  const { primaryColor, secondaryColor } = getThemeColors();

  if (isFullscreen && !isSetup) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        color: 'white'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '600px' }}>
          <Title level={1} style={{ color: 'white', fontSize: '4rem', marginBottom: '2rem' }}>
            ⚡ Focus Mode
          </Title>
          
          <div style={{ 
            fontSize: '8rem', 
            fontWeight: 'bold', 
            marginBottom: '2rem', 
            fontFamily: 'monospace',
            color: progressPercent > 75 ? '#ffcccb' : 'white',
            textShadow: progressPercent > 50 ? '0 0 20px rgba(255,255,255,0.8)' : 'none',
            transition: 'all 0.3s ease'
          }}>
            {formatTime(remainingSeconds)}
          </div>

          <Progress
            percent={progressPercent}
            showInfo={false}
            strokeColor={primaryColor}
            trailColor="rgba(255,255,255,0.3)"
            strokeWidth={8}
            style={{ marginBottom: '3rem' }}
          />

          <Space size="large">
            <Button
              type="primary"
              size="large"
              icon={isRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={isRunning ? pauseTimer : startTimer}
              style={{
                background: isRunning ? '#fa8c16' : '#52c41a',
                borderColor: isRunning ? '#fa8c16' : '#52c41a',
                height: '60px',
                fontSize: '18px',
                padding: '0 30px'
              }}
            >
              {isRunning ? 'Pause' : 'Resume'}
            </Button>

            <Button
              size="large"
              icon={<StopOutlined />}
              onClick={stopTimer}
              style={{
                background: '#ff4d4f',
                borderColor: '#ff4d4f',
                color: 'white',
                height: '60px',
                fontSize: '18px',
                padding: '0 30px'
              }}
            >
              Stop
            </Button>

            <Button
              size="large"
              icon={<FullscreenExitOutlined />}
              onClick={handleFullscreenToggle}
              style={{
                background: 'rgba(255,255,255,0.2)',
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'white',
                height: '60px',
                fontSize: '18px',
                padding: '0 30px'
              }}
            >
              Exit Fullscreen
            </Button>
          </Space>

          {remainingSeconds === 0 && (
            <div style={{ marginTop: '2rem' }}>
              <Title level={2} style={{ color: '#52c41a' }}>
                ✓ Focus Session Complete!
              </Title>
              <Text style={{ color: 'white', fontSize: '18px' }}>
                Excellent work! You've completed your focus session.
              </Text>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Modal
      title="⚡ Focus Mode"
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={500}
      centered
    >
      <div style={{ padding: '20px 0' }}>
        {isSetup ? (
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ marginBottom: '30px' }}>
              Set Your Focus Time
            </Title>
            
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ display: 'block', marginBottom: '10px' }}>
                  Minutes:
                </Text>
                <InputNumber
                  min={1}
                  max={180}
                  value={minutes}
                  onChange={(value) => setMinutes(value || 1)}
                  style={{ width: '100%' }}
                  size="large"
                />
              </div>

              <div>
                <Text strong style={{ display: 'block', marginBottom: '10px' }}>
                  Seconds:
                </Text>
                <InputNumber
                  min={0}
                  max={59}
                  value={seconds}
                  onChange={(value) => setSeconds(value || 0)}
                  style={{ width: '100%' }}
                  size="large"
                />
              </div>

              <div style={{ marginTop: '30px' }}>
                <Text style={{ fontSize: '18px', color: 'var(--color-muted)' }}>
                  Total: {formatTime(minutes * 60 + seconds)}
                </Text>
              </div>

              <Button
                type="primary"
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={startTimer}
                disabled={minutes === 0 && seconds === 0}
                style={{
                  background: 'var(--accent)',
                  borderColor: 'var(--accent)',
                  width: '100%',
                  height: '50px',
                  fontSize: '16px',
                  marginTop: '20px'
                }}
              >
                Start Focus Session
              </Button>
            </Space>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '20px', fontFamily: 'monospace' }}>
              {formatTime(remainingSeconds)}
            </div>

            <Progress
              percent={progressPercent}
              showInfo={false}
              strokeColor={primaryColor}
              style={{ marginBottom: '30px' }}
            />

            <Space size="large">
              <Button
                type="primary"
                icon={isRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={isRunning ? pauseTimer : startTimer}
                style={{
                  background: isRunning ? '#fa8c16' : 'var(--accent)',
                  borderColor: isRunning ? '#fa8c16' : 'var(--accent)'
                }}
              >
                {isRunning ? 'Pause' : 'Resume'}
              </Button>

              <Button
                danger
                icon={<StopOutlined />}
                onClick={stopTimer}
              >
                Stop
              </Button>

              <Button
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={handleFullscreenToggle}
              >
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </Button>
            </Space>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default FocusMode;
