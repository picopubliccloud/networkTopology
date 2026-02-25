import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
    initialColorMode: 'light',
    useSystemColorMode: false,
};
const theme = extendTheme({
    config,
    styles: {
        global: (props: any) => ({
            body: {
                bg: props.colorMode === 'dark' ? '#000000' : 'white', // full black in dark mode
                color: props.colorMode === 'dark' ? 'white' : 'black',
            },
        }),
    },
});
export default theme;