const AWS = require("aws-sdk");

exports.handler = async function(event, context) {
    AWS.config.credentials = new AWS.ChainableTemporaryCredentials({
        params: {
            RoleArn: event.targetAccountRole
        },
        masterCredentials: new AWS.EnvironmentCredentials('AWS')
    });
    const rs = new AWS.Redshift();
    const clusterId = event.clusterId;
    if (clusterId) {
        const resp = await rs.resumeCluster({ClusterIdentifier: clusterId}).promise();
        const cluster = resp.Cluster;
        if (cluster) {
            return cluster;
        } else {
            throw "Cluster not found";
        }
    } else {
        throw "Missing clusterId";
    }
    
}