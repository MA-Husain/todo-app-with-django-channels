import { render } from '@testing-library/react';
import Spinner from '../../components/Spinner'; // ✅ Fixed path

describe('Spinner', () => {
  test('should render spinner container and spinner element', () => {
    render(<Spinner />);

    // Check if spinner elements exist
    expect(document.querySelector('.spinner-container')).toBeInTheDocument();
    expect(document.querySelector('.spinner')).toBeInTheDocument();
  });
});
