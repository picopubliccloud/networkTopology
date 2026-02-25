import { Box } from '@chakra-ui/react'

const ServerHealth = () => {
  return (
    <Box width="100%" height="800px">
      <iframe
        src="https://192.168.30.120:3000/d/N4Cl0972342/idrac-dashboard?orgId=1&refresh=1m&from=1768970357098&to=1768973957099"
        width="100%"
        height="100%"
        frameBorder="0"
        title="Grafana Dashboard"
      ></iframe>
    </Box>
  )
}

export default ServerHealth