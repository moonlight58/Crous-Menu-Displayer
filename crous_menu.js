const { chromium } = require('playwright');

async function getMenu(index = 0) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://www.crous-bfc.fr/restaurant/resto-u-cafet-duvillard/');
  
  // Attendre que le slider soit chargé
  await page.waitForSelector('.menu.slick-slide');
  
  // Parser et formatter le contenu directement
  const menuData = await page.evaluate((idx) => {
      const menuDiv = document.querySelector(`div.menu.slick-slide[data-slick-index="${idx}"]`);
      if (!menuDiv) return null;
      
      const result = {
        date: menuDiv.querySelector('.menu_date_title')?.textContent.trim() || 'Date inconnue',
        repas: []
      };
      
      const meals = menuDiv.querySelectorAll('.meal');
      meals.forEach(meal => {
        const mealTitle = meal.querySelector('.meal_title')?.textContent.trim();
        const categories = [];
        
        const mainList = meal.querySelector('.meal_foodies');
        if (mainList) {
          mainList.querySelectorAll(':scope > li').forEach(categoryLi => {
            const categoryName = categoryLi.childNodes[0]?.textContent.trim();
            const items = [];
            
            const subList = categoryLi.querySelector('ul');
            if (subList) {
              subList.querySelectorAll('li').forEach(itemLi => {
                items.push(itemLi.textContent.trim());
              });
            }
            
            if (categoryName) {
              categories.push({ name: categoryName, items });
            }
          });
        }
        
        if (mealTitle) {
          result.repas.push({ titre: mealTitle, categories });
        }
      });
      
      return result;
    }, index);
    
    await browser.close();
    
    if (!menuData) {
      console.log(`❌ Aucun menu trouvé pour l'index ${index}`);
      return;
    }
    
    // Affichage formaté
    console.log('\n' + '='.repeat(60));
    console.log(`📅 ${menuData.date}`);
    console.log('='.repeat(60));
    
    menuData.repas.forEach(repas => {
      console.log(`\n🍽️  ${repas.titre.toUpperCase()}`);
      console.log('-'.repeat(60));
      
      repas.categories.forEach(cat => {
        // Filtrer les catégories CAF
        if (cat.name.startsWith('CAF')) {
          return;
        }
        
        console.log(`\n  📌 ${cat.name}`);
        cat.items.forEach(item => {
          console.log(`     • ${item}`);
        });
      });
    });
    
    console.log('\n' + '='.repeat(60) + '\n');
}

// Récupérer l'index depuis les arguments de ligne de commande
const index = parseInt(process.argv[2]) || 0;
getMenu(index);