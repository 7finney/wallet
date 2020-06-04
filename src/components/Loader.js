import react from 'react';
import {Layout, Spinner} from '@ui-kitten/components';
import styles from '../screens/HomeScreenStyle';

const Loader = () => {
	return (
		{showLoader && (
			<Layout style={{
				backgroundColor: '#fff',
				padding: 10,
				borderRadius: 100,
				elevation: 5,
				marginTop: 20,
				position: 'absolute',
				top: 50,
			}}>
				<Spinner size="large"/>
			</Layout>
		)
}
)
};

export default Loader;
