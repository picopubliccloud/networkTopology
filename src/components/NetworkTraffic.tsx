import { Box } from '@chakra-ui/react'

const NetworkTraffic = () => {
  return (
    <Box width="100%" height="800px">
      <iframe
        src="https://192.168.30.120:3000/d/d953ef1b-b86b-42f0-bded-e706e6034c20/dcgw-utilization-nokia?orgId=1"
        width="100%"
        height="100%"
        frameBorder="0"
        title="Grafana Dashboard"
      ></iframe>
    </Box>
  )
}

export default NetworkTraffic