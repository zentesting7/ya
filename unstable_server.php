<?php
  // это небольшой проверочный скрипт, выясняющий,
  // включены ли cookies у пользователя  
  if (rand (0,3)==1)
  {
  	header("Title: Error500",TRUE,500);
  }else
  {
	  header("Title: MegaTuboSite",TRUE,200);
	  echo '<html>';
	  echo '<head>';
	  echo '<title>Testpage | Browser test</title>';
	  echo '</head>';
	  echo '<body>';
	  echo '<p>';
	  echo 'Test page';
	  echo 'Test page';
	  echo 'Test page';
	  echo '<img src="https://ibrotesting.github.io/ya/wp-content/uploads/2017/01/16002951_1004612966336622_6271259158895442053_n.jpg">';
	  echo '</p>';

	  
	  if(empty($_GET["cookie"]))
	  {
	    // устанавливаем cookie с именем "test"
	    setcookie("test","1"); 
	  }
	  else
	  {
	    if(empty($_COOKIE["test"]))
	    {
	      echo("Для корректной работы приложения необходимо включить cookies");
	    }
	    else
	    {
	      echo("Куки есть");
	    }
	  }
	  echo '</body>';
	  echo '</html>';
  }
?>