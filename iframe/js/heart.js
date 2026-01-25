function arrangeHeartPoints(count, centerX, centerY, radius) {
    const points = [];

    if (count === 1) {
        points.push({
            x: centerX,
            y: centerY + radius * 0.6   // 尖尖朝下
        });
        return points;
    }

    const step = (2 * Math.PI) / count;
    let angle = 0;

    for (let i = 0; i < count; i++) {
        let t = angle;

        // 心形公式（原版是尖尖朝上）
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

        // 关键：翻转 Y，让尖尖朝下
        y = -y;

        // 再整体上下颠倒一次，让圆弧在上，尖尖在下
        y = -y;

        // 缩放
        const scale = radius / 16;
        x *= scale;
        y *= scale;

        // 平移
        x += centerX;
        y += centerY;

        points.push({ x, y });

        angle += step;
    }

    return points;
}

async function arrange_heart(para_radius) {

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
            sum_x += validItems[i].getState_X();
            sum_y += validItems[i].getState_Y();
        }

        let average_x;
        average_x = sum_x / count;          
        console.log("x平均值：",average_x);

        let average_y;
        average_y = sum_y / count;          
        console.log("y平均值：",average_y);
        
        const points = arrangeHeartPoints(count, average_x, average_y, para_radius);

        for (let i = 0; i < points.length; i++) {        
            validItems[i].setState_X(points[i].x);    
            validItems[i].setState_Y(points[i].y);
            validItems[i].done();
        }

    }
    catch (error)
    {
        eda.sys_ToastMessage.showMessage(error.message, 1);
    }

}

