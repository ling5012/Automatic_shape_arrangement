
function arrangeCirclePoints(count, centerX, centerY, radius) {
    const points = [];

    if (count === 1) {
        points.push({
            x: centerX,
            y: centerY - radius
        });
        return points;
    }

    const startAngle = -Math.PI / 2;
    const angleStep = (2 * Math.PI) / count;

    for (let i = 0; i < count; i++) {
        const angle = startAngle + i * angleStep;

        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        points.push({ x, y });
    }

    return points;
}




async function arrange_rotundity(para_radius) {

    try
    {            
        const validItems = await eda.pcb_SelectControl.getAllSelectedPrimitives();
        
        const count = validItems.length; // 获取数字的个数
        console.log("选中的个数：", count);
        if (count<1) {
            throw new Error(`没有选中的目标`);
        }
        
        let sum_x = 0;
        let sum_y = 0;

        for (let i = 0; i < count; i++) {
            // const validItems2 = validItems[i].getState_X()+200;
            //console.log("x:",validItems[i].getState_X());
            //console.log("y:",validItems[i].getState_Y());
            //console.log("-----------------------");                
            sum_x += validItems[i].getState_X();
            sum_y += validItems[i].getState_Y();
            //console.log(`第 ${i+1} 次累加后，总和为：${sum_x}`);
        }

        let average_x;
        average_x = sum_x / count; // 总和除以数字个数得到平均值          
        console.log("x平均值：",average_x);

        let average_y;
        average_y = sum_y / count; // 总和除以数字个数得到平均值          
        console.log("y平均值：",average_y);
        
        // validItems[i].setState_X(validItems2);
        // validItems[i].done();

        const points = arrangeCirclePoints(count, average_x, average_y, para_radius);

        for (let i = 0; i < points.length; i++) {        
            validItems[i].setState_X(points[i].x);    
            validItems[i].setState_Y(points[i].y);
            validItems[i].done();
        }

    }
    catch (error)
    {
        //console.error("出错啦！错误:", error);
        // 捕获抛出的异常，处理错误信息
        //console.error("执行中断，原因：", error.message);
        eda.sys_ToastMessage.showMessage(error.message, 1);
    }

}

    

