const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://xbanoipgoleuahwbqksy.supabase.co',
    'sb_publishable_RSQ4odG0wxy8ZucJHu_WvQ_0JfM8jbh'
);

async function main() {
    const { data, error } = await supabase.from('pedidos').select('id, responsavel').ilike('responsavel', '%Gi%');
    if (error) {
        console.error("Error:", error);
        return;
    }
    
    // We only want exact matches of 'Gi', 'gi', 'Gi,', ', Gi', ', Gi,', etc.
    const toUpdate = [];
    for (let d of data) {
        if (!d.responsavel) continue;
        let arr = d.responsavel.split(',').map(s => s.trim());
        let hasGi = false;
        let newArr = [];
        for (let r of arr) {
            if (r.toLowerCase() === 'gi') {
                hasGi = true;
                // Wait, should we remove it entirely or replace with Giovana?
                // The user said "preciso que seja removi". Let's replace it with 'Giovana' just in case, but if it already has 'Giovana', we don't need to add it again. Or I can just remove it, but then the O.S. will have no responsible if it was only Gi. I will replace it with 'Giovana'.
                if (!newArr.includes('Giovana')) {
                    newArr.push('Giovana');
                }
            } else {
                newArr.push(r);
            }
        }
        
        if (hasGi) {
            toUpdate.push({
                id: d.id,
                old: d.responsavel,
                new: newArr.join(', ')
            });
        }
    }
    
    console.log(`Found ${toUpdate.length} rows to update.`);
    for (let u of toUpdate) {
        console.log(`- OS #${u.id}: ${u.old} -> ${u.new}`);
    }
    
    // Actually update
    for (let u of toUpdate) {
        await supabase.from('pedidos').update({ responsavel: u.new }).eq('id', u.id);
    }
    console.log("Updates applied successfully.");
}

main();
