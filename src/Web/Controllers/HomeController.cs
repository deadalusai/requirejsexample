using Microsoft.AspNetCore.Mvc;

namespace Web.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult React()
        {
            return View();
        }

        public IActionResult Angular2()
        {
            return View();   
        }
    }
}
