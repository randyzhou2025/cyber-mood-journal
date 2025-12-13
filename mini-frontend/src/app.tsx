import { PropsWithChildren } from 'react';
import './app.scss';

function App({ children }: PropsWithChildren) {
  return children as unknown as JSX.Element;
}

export default App;
