// 生成箭头顶点坐标
function arrangeArrowPoints(count, centerX, centerY, radius) {
    const points = [];
    // 箭头的宽度和长度比例
    const arrowWidth = radius * 0.6;
    const arrowHeadLength = radius * 0.4;

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
        let x, y;

        // 区分箭头头部和箭身
        if (i === 0) {
            // 箭头头部（最上方）
            x = centerX;
            y = centerY - radius;
        } else if (i === 1 || i === count - 1) {
            // 箭头两侧
            x = centerX + (i === 1 ? arrowWidth : -arrowWidth);
            y = centerY - (radius - arrowHeadLength);
        } else {
            // 箭身部分
            x = centerX + (radius * 0.2) * Math.cos(angle);
            y = centerY + (radius * 0.2) * Math.sin(angle);
        }

        points.push({ x, y });
    }

    return points;
}

// 箭头排列主函数
async function arrange_arrow(para_radius) {
    try {
        const validItems = await eda.pcb_SelectControl.getAllSelectedPrimitives();
        const count = validItems.length;
        console.log("选中的个数：", count);
        
        if (count < 1) {
            throw new Error(`没有选中的目标`);
        }

        let sum_x = 0, sum_y = 0;
        for (let i = 0; i < count; i++) {
            sum_x += validItems[i].getState_X();
            sum_y += validItems[i].getState_Y();
        }
        const average_x = sum_x / count;
        const average_y = sum_y / count;
        console.log("中心坐标：", average_x, average_y);

        const points = arrangeArrowPoints(count, average_x, average_y, para_radius);

        for (let i = 0; i < points.length; i++) {
            validItems[i].setState_X(points[i].x);
            validItems[i].setState_Y(points[i].y);
            validItems[i].done();
        }

    } catch (error) {
        eda.sys_ToastMessage.showMessage(error.message, 1);
    }
}

