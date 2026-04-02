import styles from './terminal-mockup.module.css';

export type TerminalLine =
  | { type: 'cmd'; text: string }
  | { type: 'output'; text: string }
  | { type: 'success'; text: string }
  | { type: 'error'; text: string }
  | { type: 'muted'; text: string }
  | { type: 'blank' };

export default function TerminalMockup({
  title = 'Terminal',
  lines,
}: {
  title?: string;
  lines: TerminalLine[];
}) {
  return (
    <div className={styles.window}>
      <div className={styles.titleBar}>
        <span className={styles.dot} style={{ background: '#ff5f57' }} />
        <span className={styles.dot} style={{ background: '#febc2e' }} />
        <span className={styles.dot} style={{ background: '#28c840' }} />
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.body}>
        {lines.map((line, i) => {
          if (line.type === 'blank') return <div key={i} className={styles.blank} />;
          if (line.type === 'cmd') {
            return (
              <div key={i} className={styles.line}>
                <span className={styles.prompt}>❯</span>
                <span className={styles.cmd}> {line.text}</span>
              </div>
            );
          }
          return (
            <div key={i} className={`${styles.line} ${styles[line.type]}`}>
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
