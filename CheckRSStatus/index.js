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
        const clusters = await rs.describeClusters({ClusterIdentifier: clusterId}).promise();
        if (clusters.Clusters.length > 0) {
            return clusters.Clusters[0];
        } else {
            throw "Cluster not found";
        }
    } else {
        throw "Missing clusterId";
    }
    
}