import AppRouter from '@/routes/AppRouter'
import { AuthProvider, ThemeProvider } from './providers'

const App = () => (
	<ThemeProvider>
		<AuthProvider>
			<AppRouter />
		</AuthProvider>
	</ThemeProvider>
)

export default App
