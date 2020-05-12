import React, { useEffect, useState } from 'react';
import { StyleSheet, ToastAndroid } from 'react-native';
import { IndexPath, Layout, Select, SelectItem } from '@ui-kitten/components';
var RNFS = require('react-native-fs');

export const KsSelect = () => {
    const [ksfiles, setKsFiles] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0));
    const displayValue = ksfiles[selectedIndex.row] && ksfiles[selectedIndex.row].name ? ksfiles[selectedIndex.row].name : undefined;


    const renderOption = (f) => (
        <SelectItem title={f.name} key={f.name} />
    );
    const setKeystore = (index) => {
        console.log(ksfiles[index.row]);
        const p = ksfiles[index.row].path;
        console.log(p);
        
        RNFS.readFile(p, 'utf8')
            .then(async keyObject => {
                await setToAsyncStorage('keystore', JSON.stringify(keyObject));
            })
            .catch(e => {
                throw e;
            })
    }
    isJSONfile = (n) => {
        if(n.split('.').pop() === "json") {
            return true;
        }
        return false;
    }

    // First read keystore files from DocumentDirectory
    useEffect(() => {
        ToastAndroid.showWithGravity('Looking for saved Keystores', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        RNFS.readDir(RNFS.DocumentDirectoryPath)
            .then(results => {
                console.log('GOT RESULT', results);
                const files = results.filter(result => result.isFile() && isJSONfile(result.name));
                setKsFiles(files);
            })
            .catch(err => {
                console.error(err);
                throw err;
            })
    }, [])

    return (
        <Layout style={styles.container} level='1'>
            <Select
                selectedIndex={selectedIndex}
                onSelect={index => {
                    setKeystore(index);
                    setSelectedIndex(index)
                }}
                value={displayValue}>
                {ksfiles.map(renderOption)}
            </Select>
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: {
        minHeight: 128,
    },
});