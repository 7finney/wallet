import { StyleSheet, Dimensions } from 'react-native';
const styles = StyleSheet.create({
    container: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    homeHeader: {
        padding: 10,
        width: '100%',
        backgroundColor: '#2d4bf7',
        zIndex: 10000,
    },
    homeHeaderText: {
        textAlign: 'center',
        color: '#fff',
        marginBottom: 2,
    },
    signBtn: {
        margin: 10,
        zIndex: 999,
        width: Dimensions.get('window').width - 50,
    },
    icon: {
        width: 32,
        height: 32,
    },
    error: {
        backgroundColor: '#eb4034',
        width: '100%',
        padding: 20,
    },
    spinner: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 100,
        elevation: 5,
        marginTop: 20,
        position: 'absolute',
        top: 50,
    }
});

export default styles;