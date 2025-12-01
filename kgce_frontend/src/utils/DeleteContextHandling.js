import { useTreeStore } from '../stores/TreeStore.js'


export function deleteContextInstruction(msg, index){
    const treeStore = useTreeStore();
    const node = treeStore.nodeIdToNode[msg.nodeId];
    const newStoredPaths = []
    for(const path of treeStore.storedPaths){
        const nodeIndex = path.findIndex(n => n.id === node.id);

        if(nodeIndex !== -1){
            // path.splice(nodeIndex, 1);
            path.splice(nodeIndex);
        }
        newStoredPaths.push(path);
    }    
    treeStore.setStoredPaths(newStoredPaths);
    
    const currentPath = treeStore.getCurrentPath;
    const currentNodeIndex = currentPath.findIndex(n => n.id === node.id);
    if(currentNodeIndex !== -1){
        const newCurrentPath = currentPath.slice(0, currentNodeIndex);
        treeStore.setCurrentPath(newCurrentPath);
    }
}