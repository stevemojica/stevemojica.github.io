import { GitHubCalendar } from 'react-github-calendar';
import { useTheme } from '../ThemeContext';

function ContribGraph() {
  const { theme } = useTheme();

  const explicitTheme = {
    light: [
      '#ebedf0',
      'rgba(220, 20, 60, 0.25)',
      'rgba(220, 20, 60, 0.5)',
      'rgba(220, 20, 60, 0.75)',
      'rgba(220, 20, 60, 1.0)',
    ],
    dark: [
      '#171d27',
      'rgba(220, 20, 60, 0.2)',
      'rgba(220, 20, 60, 0.5)',
      'rgba(220, 20, 60, 0.8)',
      'rgba(220, 20, 60, 1.0)',
    ]
  };

  return (
    <div className="contrib-graph">
      <GitHubCalendar
        username="stevemojica"
        theme={explicitTheme}
        colorScheme={theme}
        blockSize={12}
        blockMargin={4}
        fontSize={14}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center'
        }}
      />
    </div>
  )
}

export default ContribGraph
